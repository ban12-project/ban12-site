import { revalidatePath, revalidateTag } from 'next/cache'

export async function PUT(request: Request) {
  const providedSecretKey = request.headers.get('Authorization')
  if (
    !providedSecretKey ||
    providedSecretKey !== process.env.REVALIDATION_TOKEN
  ) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { paths = [], tags = [] } = await request.json()
  let revalidated = false

  try {
    if (paths && Array.isArray(paths) && paths.length > 0) {
      paths.forEach((path) => revalidatePath(path))
      console.log('Revalidated paths:', paths)
      revalidated = true
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => revalidateTag(tag))
      console.log('Revalidated tags:', tags)
      revalidated = true
    }

    return new Response(
      JSON.stringify({
        revalidated,
        now: Date.now(),
        paths,
        tags,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ message: 'Error revalidating paths or tags' }),
      {
        status: 500,
      },
    )
  }
}
