import { headers } from 'next/headers';
import * as z from 'zod';

/** https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#accepted-parameters */
interface TurnstileResponse {
  success: boolean;
  /** challenge_ts is the ISO timestamp for the time the challenge was solved. */
  challenge_ts: string;
  /** hostname is the hostname for which the challenge was served. */
  hostname: string;
  /**
   * error-codes is a list of errors that occurred.
   * missing-input-secret	The secret parameter was not passed.
   * invalid-input-secret	The secret parameter was invalid, did not exist, or is a testing secret key with a non-testing response.
   * missing-input-response	The response parameter (token) was not passed.
   * invalid-input-response	The response parameter (token) is invalid or has expired. Most of the time, this means a fake token has been used. If the error persists, contact customer support.
   * bad-request	The request was rejected because it was malformed.
   * timeout-or-duplicate	The response parameter (token) has already been validated before. This means that the token was issued five minutes ago and is no longer valid, or it was already redeemed.
   * internal-error	An internal error happened while validating the response. The request can be retried.
   */
  'error-codes': (
    | 'missing-input-secret'
    | 'invalid-input-secret'
    | 'missing-input-response'
    | 'invalid-input-response'
    | 'bad-request'
    | 'timeout-or-duplicate'
    | 'internal-error'
  )[];
  /** action is the customer widget identifier passed to the widget on the client side. This is used to differentiate widgets using the same sitekey in analytics. Its integrity is protected by modifications from an attacker. It is recommended to validate that the action matches an expected value. */
  action: string;
  /** cdata is the customer data passed to the widget on the client side. This can be used by the customer to convey state. It is integrity protected by modifications from an attacker. */
  cdata: string;
  metadata: {
    /** (Enterprise only) ephemeral_id returns the Ephemeral ID in siteverify. */
    ephemeral_id: string;
  };
}

export async function cfTurnstileVerify(response: string) {
  const form = new FormData();
  form.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY!);
  form.append('response', response);
  const headersList = await headers();
  const ip =
    headersList.get('Cf-Connecting-IP') ||
    headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip');
  if (ip) form.append('remoteip', ip);

  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form },
  );
  const json: TurnstileResponse = await result.json();
  return json;
}

export const cfTurnstileResponseSchema = z.object({
  response: z.string().nonempty(),
});
