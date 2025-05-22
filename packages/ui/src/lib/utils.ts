import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const cache = new Map()

/**
 * @param width
 * @param height
 * @param n [n=5] Squircle: N=4, iOS icons: N=5
 */
export function generateSuperEllipseSVGPath(
  ...props:
    | [number, number]
    | [number, number, number | undefined]
    | [number, number, number | undefined, number | undefined]
): string {
  const [x, y, n = 5, steps = 128] = props
  const key = props.join(',')
  if (cache.has(key)) return cache.get(key)

  const a = x / 2
  const b = y / 2
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    const r = Math.pow(
      Math.pow(Math.abs(cosTheta), n) + Math.pow(Math.abs(sinTheta), n),
      -1 / n,
    )
    const px = Math.round((a * r * cosTheta + a) * 1000) / 1000
    const py = Math.round((b * r * sinTheta + b) * 1000) / 1000

    if (i === 0) {
      path += `M${px} ${py}`
    } else {
      path += `L${px} ${py}`
    }
  }
  path += 'Z'

  cache.set(key, path)
  return path
}

export function generateBase64(props: {
  width: number
  height: number
  n?: number
  steps?: number
}) {
  const path = generateSuperEllipseSVGPath(
    props.width,
    props.height,
    props.n,
    props.steps,
  )

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${props.width} ${props.height}" width="${props.width}" height="${props.height}"><path d="${path}" fill="white" /></svg>`

  const base64 = `data:image/svg+xml;base64,${btoa(svg)}`

  return base64
}
