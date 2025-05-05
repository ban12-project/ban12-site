onmessage = async (event: MessageEvent<File>) => {
  const { CreateSha256 } = await import('#/pkg')

  const file = event.data

  const sha256 = new CreateSha256()
  sha256.init()

  const chunkSize = 1024 * 1024 * 2
  let start = 0
  let progress = 0
  const totalSize = file.size

  const startTime = Date.now()
  while (start < totalSize) {
    progress = start / totalSize
    postMessage({ progress, time: Date.now() - startTime })
    const end = Math.min(start + chunkSize, totalSize)
    const chunk = file.slice(start, end)
    start = end
    const buffer = new Uint8Array(await chunk.arrayBuffer())
    sha256.update(buffer)
  }
  postMessage({
    sha256: sha256.digest('hex'),
    progress: 1,
    time: Date.now() - startTime,
  })
}

// Add an empty export statement to signal this is an ES module.
// This satisfies the bundler's requirement without changing runtime behavior.
export {};
