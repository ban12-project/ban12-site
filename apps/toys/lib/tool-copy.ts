export type ToolLocale = 'en' | 'zh-CN';

export const toolCopy = {
  en: {
    hash: {
      title: 'Calculate SHA-256 hashes',
      description:
        'Drop one or more files to calculate their SHA-256 hash locally. Your files stay in this browser tab.',
      drop: 'Drop files here or choose files',
      privacy: 'SHA-256 is calculated locally in your browser',
      results: 'Results',
      clearAll: 'Clear all',
      empty: 'Your calculated hashes will appear here.',
    },
    exif: {
      title: 'View file metadata',
      description:
        'Inspect EXIF and technical metadata locally in your browser. Files are never uploaded.',
      choose: 'Choose an image or document',
      privacy:
        'Metadata is read locally in your browser and is never uploaded.',
      drop: 'Drop a file here or choose one',
      reading: 'Reading metadata…',
      copied: 'Copied',
      copy: 'Copy',
      clear: 'Clear',
      metadata: 'Metadata',
      failed: 'Unable to read metadata. Try another file.',
    },
    sevenZip: {
      title: 'Compress & extract archives',
      description:
        'Process files locally with 7-Zip WebAssembly. Nothing is uploaded, and you can save the result when it is ready.',
      operation: 'Operation',
      compress: 'Compress files',
      extract: 'Extract archive',
      choose: 'Choose files',
      chooseArchive: 'Choose an archive or drop it here',
      chooseFiles: 'Choose files or drop them here',
      multiple: 'You can select multiple files',
      archiveSupport:
        'Supports ZIP, 7z, TAR, GZIP and other supported archives',
      saveReady: (count: number) =>
        `${count} output file${count === 1 ? '' : 's'} ready to save`,
      saveHint: 'Use Save output below to download the result',
      save: 'Save output',
      processing: 'Processing…',
      complete: 'Processing complete. Save the output to your device.',
    },
    qr: {
      title: 'Generate a QR code',
      description:
        'Create a QR code from text or a URL entirely in your browser, then download it as a PNG.',
      type: 'Content type',
      value: 'Text or URL',
      urlPlaceholder: 'https://example.com…',
      textPlaceholder: 'Enter text…',
      emailPlaceholder: 'name@example.com',
      phonePlaceholder: '+1 555 123 4567',
      wifiPlaceholder: 'Network name (SSID)',
      password: 'Wi-Fi password',
      security: 'Security',
      hidden: 'Hidden network',
      errorCorrection: 'Error correction',
      generate: 'Generate QR Code',
      ready: 'Your QR code is ready',
      download: 'Download PNG',
      clear: 'Clear result',
      empty: 'Enter text or a URL to generate a QR code.',
      invalidEmail: 'Enter a valid email address.',
      invalidPhone: 'Enter a valid phone number.',
      wifiName: 'Enter a Wi-Fi network name.',
      tooLong:
        'This content is too long for the selected error correction level. Try shorter text or a lower level.',
    },
    compare: {
      title: 'Compare text differences',
      description:
        'Paste two versions of text to see a line-by-line diff. Comparison runs locally in your browser.',
      original: 'Original text',
      updated: 'Updated text',
      originalPlaceholder: 'Paste the original text…',
      updatedPlaceholder: 'Paste the updated text…',
      diff: 'Diff',
      clear: 'Clear',
      empty: 'Enter text above to see differences.',
      crate: 'Rust crate created by',
    },
  },
  'zh-CN': {
    hash: {
      title: '计算 SHA-256 哈希',
      description:
        '拖入一个或多个文件，在本地计算 SHA-256 哈希。文件只保留在当前浏览器标签页中。',
      drop: '将文件拖到这里，或选择文件',
      privacy: 'SHA-256 在浏览器本地计算',
      results: '结果',
      clearAll: '全部清除',
      empty: '计算出的哈希值会显示在这里。',
    },
    exif: {
      title: '查看文件元数据',
      description: '在浏览器本地查看 EXIF 和技术元数据，文件不会上传。',
      choose: '选择图片或文档',
      privacy: '元数据在浏览器本地读取，文件不会上传。',
      drop: '将文件拖到这里，或选择一个文件',
      reading: '正在读取元数据…',
      copied: '已复制',
      copy: '复制',
      clear: '清除',
      metadata: '元数据',
      failed: '无法读取元数据，请尝试其他文件。',
    },
    sevenZip: {
      title: '压缩和解压归档文件',
      description:
        '使用 7-Zip WebAssembly 在本地处理文件。文件不会上传，完成后可以保存结果。',
      operation: '操作',
      compress: '压缩文件',
      extract: '解压归档',
      choose: '选择文件',
      chooseArchive: '选择归档文件，或拖到这里',
      chooseFiles: '选择文件，或拖到这里',
      multiple: '可以选择多个文件',
      archiveSupport: '支持 ZIP、7z、TAR、GZIP 和其他归档格式',
      saveReady: (count: number) => `${count} 个输出文件已准备保存`,
      saveHint: '使用下方的“保存输出”下载结果',
      save: '保存输出',
      processing: '处理中…',
      complete: '处理完成，请保存输出文件。',
    },
    qr: {
      title: '生成二维码',
      description: '完全在浏览器中从文本或链接生成二维码，并下载为 PNG。',
      type: '内容类型',
      value: '文本或链接',
      urlPlaceholder: 'https://example.com…',
      textPlaceholder: '输入文本…',
      emailPlaceholder: 'name@example.com',
      phonePlaceholder: '+86 138 0000 0000',
      wifiPlaceholder: '网络名称（SSID）',
      password: 'Wi-Fi 密码',
      security: '安全类型',
      hidden: '隐藏网络',
      errorCorrection: '纠错级别',
      generate: '生成二维码',
      ready: '二维码已生成',
      download: '下载 PNG',
      clear: '清除结果',
      empty: '输入文本或链接以生成二维码。',
      invalidEmail: '请输入有效的邮箱地址。',
      invalidPhone: '请输入有效的电话号码。',
      wifiName: '请输入 Wi-Fi 网络名称。',
      tooLong: '内容超出当前纠错级别的容量，请缩短文本或降低纠错级别。',
    },
    compare: {
      title: '比较文本差异',
      description:
        '粘贴两个版本的文本，查看逐行差异。比较过程在浏览器本地完成。',
      original: '原始文本',
      updated: '更新后的文本',
      originalPlaceholder: '粘贴原始文本…',
      updatedPlaceholder: '粘贴更新后的文本…',
      diff: '差异',
      clear: '清除',
      empty: '输入文本后即可查看差异。',
      crate: 'Rust crate 作者：',
    },
  },
} as const;

type WidenCopy<T> = {
  [Key in keyof T]: T[Key] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result
    : string;
};

export type HashCopy = WidenCopy<(typeof toolCopy)['en']['hash']>;
export type SevenZipCopy = WidenCopy<(typeof toolCopy)['en']['sevenZip']>;
