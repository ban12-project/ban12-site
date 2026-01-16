self.onmessage = async (
  event: MessageEvent<{
    name: string;
    type: string;
    size: number;
    lastModified: number;
    data: ArrayBuffer;
  }>,
) => {
  const { CreateSha256 } = await import('@crates/calculate-hash/pkg');

  const { size, data } = event.data;

  const sha256 = new CreateSha256();
  sha256.init();

  const chunkSize = 1024 * 1024 * 2;
  let start = 0;
  let progress = 0;

  const startTime = Date.now();
  while (start < size) {
    progress = start / size;
    postMessage({ progress, time: Date.now() - startTime });
    const end = Math.min(start + chunkSize, size);
    const chunk = data.slice(start, end);
    start = end;
    const buffer = new Uint8Array(chunk);
    sha256.update(buffer);
  }
  postMessage({
    sha256: sha256.digest('hex'),
    progress: 1,
    time: Date.now() - startTime,
  });
};

// Add an empty export statement to signal this is an ES module.
// This satisfies the bundler's requirement without changing runtime behavior.
export {};
