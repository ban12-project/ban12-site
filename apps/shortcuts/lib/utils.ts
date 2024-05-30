import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @param size bytes
 */
export const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} bytes`
  } else if (size >= 1024 && size < 1048576) {
    return `${(size / 1024).toFixed(1)} KB`
  } else if (size >= 1048576 && size < 1073741824) {
    return `${(size / 1048576).toFixed(1)} MB`
  } else {
    return `${(size / 1073741824).toFixed(1)} GB`
  }
}

export const IN_BROWSER = typeof window !== 'undefined'

export function negativeToHexColor(color: string) {
  const negativeNumber = Number.parseInt(color)

  // 将负数转换为 32 位无符号整数
  const unsignedNumber = negativeNumber >>> 0

  // 将无符号整数转换为 16 进制
  let hexValue = unsignedNumber.toString(16)

  // 确保长度为 8 位，不足的前面补 0
  while (hexValue.length < 8) {
    hexValue = '0' + hexValue
  }

  // 返回 ARGB 颜色值
  return `#${hexValue}`
}
