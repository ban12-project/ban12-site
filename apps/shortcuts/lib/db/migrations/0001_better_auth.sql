DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "user" WHERE "email" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate auth users with null email';
  END IF;
END $$;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now();
UPDATE "user" SET
  "name" = COALESCE("name", "email"),
  "createdAt" = COALESCE("createdAt", now()),
  "updatedAt" = COALESCE("updatedAt", now());
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "emailVerifiedAt";
ALTER TABLE "user" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;
UPDATE "user" SET "emailVerified" = "emailVerifiedAt" IS NOT NULL;
ALTER TABLE "user" DROP COLUMN "emailVerifiedAt";

CREATE TABLE IF NOT EXISTS "passkey" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "publicKey" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "credentialID" text NOT NULL,
  "counter" integer NOT NULL,
  "deviceType" text NOT NULL,
  "backedUp" boolean NOT NULL,
  "transports" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "aaguid" text
);
INSERT INTO "passkey" (
  "id",
  "name",
  "publicKey",
  "userId",
  "credentialID",
  "counter",
  "deviceType",
  "backedUp",
  "transports"
)
SELECT
  "credentialID",
  NULL,
  "credentialPublicKey",
  "userId",
  "credentialID",
  "counter",
  "credentialDeviceType",
  "credentialBackedUp",
  "transports"
FROM "authenticator"
ON CONFLICT ("id") DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS "passkey_credential_id_idx" ON "passkey" ("credentialID");
CREATE INDEX IF NOT EXISTS "passkey_user_id_idx" ON "passkey" ("userId");
DROP TABLE IF EXISTS "authenticator";

DROP TABLE IF EXISTS "session";
CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "ipAddress" text,
  "userAgent" text
);

DROP TABLE IF EXISTS "verificationToken";
DROP TABLE IF EXISTS "verification";
CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL
);

DROP TABLE IF EXISTS "account";
CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "providerId" text NOT NULL,
  "accountId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text
);
CREATE UNIQUE INDEX "account_provider_account_id_idx" ON "account" ("providerId", "accountId");

INSERT INTO "account" (
  "id",
  "providerId",
  "accountId",
  "userId",
  "password"
)
SELECT
  'credential:' || "id",
  'credential',
  "id",
  "id",
  NULL
FROM "user"
WHERE "password" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
