import { useEffect, useState } from 'react';

function download(data: { blob: Blob; filename: string }[]) {
  for (const { blob, filename } of data) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function useSaveFile() {
  const [isSupportShowSaveFilePicker, setIsSupportShowSaveFilePicker] =
    useState(false);

  useEffect(() => {
    setIsSupportShowSaveFilePicker('showSaveFilePicker' in self);
  }, []);

  if (!isSupportShowSaveFilePicker)
    return { isSupportShowSaveFilePicker, saveFile: download };

  // fileHandle is an instance of FileSystemFileHandle..
  async function writeFile(fileHandle: FileSystemFileHandle, contents: Blob) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
  }

  const saveFile = async (data: { blob: Blob; filename: string }[]) => {
    // If only one file, use showSaveFilePicker to reduce permission prompts.
    if (data.length === 1) {
      try {
        const [{ blob, filename }] = data;
        const [description, ext] = filename.split('.');
        const handle = await window.showSaveFilePicker({
          types: [
            {
              description,
              accept: {
                [blob.type as MIMEType]: [`.${ext}`],
              },
            },
          ],
        });
        await writeFile(handle, blob);
      } catch (_error) {
        // continue regardless of error
      }

      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      for (const { blob, filename } of data) {
        const fileHandle = await dirHandle.getFileHandle(filename, {
          create: true,
        });
        await writeFile(fileHandle, blob);
      }
    } catch (_error) {
      // continue regardless of error
    }
  };

  return { isSupportShowSaveFilePicker, saveFile };
}
