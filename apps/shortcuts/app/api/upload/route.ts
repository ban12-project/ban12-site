import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { auth } from '#/lib/auth';

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  const { contentType } = (await request.json()) as {
    filename: string;
    contentType: string;
  };

  if (
    !process.env.S3_BUCKET_ACCESS_KEY_ID ||
    !process.env.S3_BUCKET_SECRET_ACCESS_KEY ||
    !process.env.S3_BUCKET_NAME
  ) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  try {
    const client = new S3Client({
      region: process.env.S3_BUCKET_REGION,
      endpoint: process.env.S3_BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
      },
    });

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: globalThis.crypto.randomUUID(),
        ACL: 'public-read',
        ContentType: contentType,
      }),
      { expiresIn: 600 },
    );

    return Response.json({ url });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
