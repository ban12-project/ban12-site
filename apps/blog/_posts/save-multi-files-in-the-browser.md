---
title: '浏览器中的多文件保存'
excerpt: '使用 File System API 访问系统文件以及文件夹'
coverImage: 'https://assets.ban12.com/blog/save-multi-files-in-the-browser/cover.png'
date: '2024-11-28T08:52:13.575Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://assets.ban12.com/blog/save-multi-files-in-the-browser/cover.png'
---

# 过时的方式

使用动态创建的 a 标签 添加 link 和 download 属性设置文件名来模拟点击下载实现的文件保存，这样在多个文件的时候不够优雅，并且有些浏览器可能会因为防止恶意下载阻止掉一些文件

示例代码

```javascript
function download(data: { blob: Blob; filename: string }[]) {
  for (const { blob, filename } of data) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url // file url
    a.download = filename // file name
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

在搜索解决办法时还看到过使用 zip.js 把多个文件压缩成一个 zip 包来保存的技巧，现在有了新 API 就不用这么麻烦了。
这里提一嘴 wasm 包装的 [7-zip 网站](https://toys.ban12.com/7-zip)，支持所有桌面端的 7-zip 功能。~~目前受限于 RAM FS 只是不能处理超过 2GB 的文件，这个在将来可能会被解决。~~

# 在 chrome/edge 86 可以使用的 File System API

在网站首次调用 `showDirectoryPicker` 用户选择一个目录后会弹出一个权限请求，这个权限请求被允许后不会再次显示

```javascript
async function saveFile(data: { blob: Blob; filename: string }[]) {
  const isSupportShowSaveFilePicker = 'showSaveFilePicker' in self
  if (!isSupportShowSaveFilePicker) return download(data) //

  // fileHandle is an instance of FileSystemFileHandle..
  async function writeFile(fileHandle: FileSystemFileHandle, contents: Blob) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable()
    // Write the contents of the file to the stream.
    await writable.write(contents)
    // Close the file and write the contents to disk.
    await writable.close()
  }

  // If only one file, use showSaveFilePicker to reduce permission prompts.
  if (data.length === 1) {
    try {
      const [{ blob, filename }] = data
      const [description, ext] = filename.split('.')
      const handle = await window.showSaveFilePicker({
        types: [
          {
            description,
            accept: {
              [blob.type as MIMEType]: [`.${ext}`],
            },
          },
        ],
      })
      await writeFile(handle, blob)
    } catch (error) {
      // continue regardless of error
    }

    return
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    })

    for (const { blob, filename } of data) {
      const fileHandle = await dirHandle.getFileHandle(filename, {
        create: true,
      })
      await writeFile(fileHandle, blob)
    }
  } catch (error) {
    // continue regardless of error
  }
}
```

这里给出的代码仅用于保存文件，读取文件夹列出目录/文件以及更多接口以及用法参考下面链接

# Reference

[https://developer.mozilla.org/docs/Web/API/File_System_API](https://developer.mozilla.org/docs/Web/API/File_System_API)
[https://developer.chrome.com/docs/capabilities/web-apis/file-system-access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)

![473](https://assets.ban12.com/blog/save-multi-files-in-the-browser/good.png)
