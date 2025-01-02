export async function submitURLs(urlList: string[]) {
  if (
    !process.env.INDEX_NOW_API_KEY ||
    !process.env.INDEX_NOW_HOST_URL ||
    !process.env.NEXT_PUBLIC_HOST_URL
  )
    throw new Error('Missing environment variables')

  const { host } = new URL(process.env.NEXT_PUBLIC_HOST_URL)

  try {
    const response = await fetch(process.env.INDEX_NOW_HOST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key: process.env.INDEX_NOW_API_KEY,
        keyLocation: new URL(
          process.env.INDEX_NOW_API_KEY + '.txt',
          process.env.NEXT_PUBLIC_HOST_URL,
        ).href,
        urlList,
      }),
    })

    if (!response.ok) throw new Error(response.statusText)
  } catch (e) {
    console.error(e)
  }
}
