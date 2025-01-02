function readExif(buffer: ArrayBuffer) {
  const view = new DataView(buffer)
  let offset = 0
  // SOI (Start of Image); indicates the beginning of the image structure.
  const SOI = 0xffd8
  if (view.getUint16(offset) !== SOI) throw new Error('not a valid JPEG')

  // SOS (Start of Scan); indicates the beginning of the image-related data.
  const SOS = 0xffda
  // APPn (Application-related tags); following the SOI marker, with n between 0 and F (https://exiftool.org/TagNames/JPEG.html). For example, APP11 (or 0xFFEB) is for HDR data, APP13 (or 0xFFED) for Photoshop and APP1 (or 0xFFE1) for EXIF.
  const APP1 = 0xffe1
  // Skip the last two bytes 0000 and just read the four first bytes
  const EXIF = 0x45786966

  const LITTLE_ENDIAN = 0x4949
  const BIG_ENDIAN = 0x4d4d

  const TAG_ID_EXIF_SUB_IFD_POINTER = 0x8769

  const MAKER_NOTE = 0x927c
  const CONTENT_IDENTIFIER = 0x0011

  let marker: number | null = null
  // The first two bytes (offset 0-1) was the SOI marker
  offset += 2
  while (marker !== SOS) {
    marker = view.getUint16(offset)
    const size = view.getUint16(offset + 2)
    if (marker === APP1 && view.getUint32(offset + 4) === EXIF) {
      // The APP1 here is at the very beginning of the file
      // So at this point offset = 2,
      // + 10 to skip to the bytes after the Exif word
      offset += 10

      let isLittleEndian: boolean | undefined
      if (view.getUint16(offset) === LITTLE_ENDIAN) isLittleEndian = true
      if (view.getUint16(offset) === BIG_ENDIAN) isLittleEndian = false
      // if (!isLittleEndian) throw new Error('invalid endian')
      // From now, the endianness must be specify each time we read bytes
      // 42
      if (view.getUint16(offset + 2, isLittleEndian) !== 0x2a) {
        throw new Error('invalid endian')
      }

      // At this point offset = 12
      // IFD0 offset is given by the next 4 bytes after 42
      const ifd0Offset = view.getUint32(offset + 4, isLittleEndian)
      const ifd0TagsCount = view.getUint16(offset + ifd0Offset, isLittleEndian)
      // IFD0 ends after the two-byte tags count word + all the tags
      const endOfIFD0TagsOffset = offset + ifd0Offset + 2 + ifd0TagsCount * 12

      // To store the Exif IFD offset
      let exifSubIfdOffset = 0
      for (let i = offset + ifd0Offset + 2; i < endOfIFD0TagsOffset; i += 12) {
        // First 2 bytes = tag type
        const tagId = view.getUint16(i, isLittleEndian)

        // If ExifIFD offset tag
        if (tagId === TAG_ID_EXIF_SUB_IFD_POINTER) {
          // It's a LONG, so 4 bytes must be read
          exifSubIfdOffset = view.getUint32(i + 8, isLittleEndian)
        }
      }

      if (exifSubIfdOffset) {
        const exifSubIfdTagsCount = view.getUint16(
          offset + exifSubIfdOffset,
          isLittleEndian,
        )
        // This IFD also ends after the two-byte tags count word + all the tags
        const endOfExifSubIfdTagsOffset =
          offset + exifSubIfdOffset + 2 + exifSubIfdTagsCount * 12
        for (
          let i = offset + exifSubIfdOffset + 2;
          i < endOfExifSubIfdTagsOffset;
          i += 12
        ) {
          if (exifSubIfdOffset) {
            const exifSubIfdTagsCount = view.getUint16(
              offset + exifSubIfdOffset,
              isLittleEndian,
            )
            const endOfExifSubIfdTagsOffset =
              offset + exifSubIfdOffset + 2 + exifSubIfdTagsCount * 12

            for (
              let i = offset + exifSubIfdOffset + 2;
              i < endOfExifSubIfdTagsOffset;
              i += 12
            ) {
              const tagId = view.getUint16(i, isLittleEndian)

              const MAKER_NOTE_OFFSET = 0
              if (tagId === MAKER_NOTE) {
              }
            }
          }
        }
      }

      return new Blob([view])
    }

    // Skip the entire segment (header of 2 bytes + size of the segment)
    offset += 2 + size
  }
}

export async function reader(file: File | Blob, newValue?: string) {
  const reader = new FileReader()

  return await new Promise<Blob>((resolve, reject) => {
    try {
      reader.onload = ({ target }) => {
        if (!target) throw new Error('no blob found')
        const { result: buffer } = target
        if (!buffer || typeof buffer === 'string')
          throw new Error('not a valid JPEG')

        const data = readExif(buffer)
        if (!data) throw new Error('no exif found')

        resolve(data)
      }
    } catch (e) {
      reject(e)
    }

    reader.readAsArrayBuffer(file)
  })
}
