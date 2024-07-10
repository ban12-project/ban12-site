import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const runtime = 'edge'

export async function POST(request: Request) {
  const { filename, contentType } = await request.json()

  try {
    const client = new S3Client({
      region: process.env.S3_BUCKET_REGION,
      endpoint: process.env.S3_BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY!,
      },
    })

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: globalThis.crypto.randomUUID(),
        ACL: 'public-read',
        ContentType: contentType,
      }),
      { expiresIn: 600 },
    )

    return Response.json({ url })
  } catch (error) {
    return Response.json({ error })
  }
}
