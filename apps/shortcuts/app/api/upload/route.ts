import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

export const runtime = 'edge'

export async function POST(request: Request) {
  const { filename, contentType } = await request.json()

  try {
    const client = new S3Client({
      forcePathStyle: true,
      region: process.env.S3_BUCKET_REGION,
      endpoint: process.env.S3_BUCKET_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY!,
      },
    })
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: globalThis.crypto.randomUUID(),
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    })

    return Response.json({ url, fields })
  } catch (error) {
    return Response.json({ error })
  }
}
