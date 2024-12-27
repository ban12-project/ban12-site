import { ImageResponse } from 'next/og'
import { generateBase64 } from '@repo/ui/super-ellipse-svg'

type Props = {
  title?: string
  width?: number
  height?: number
  backgroundColor?: string
  textColor: string[]
}

function scale(value: number, n1: number, n2: number, n3: number, n4: number) {
  const normalized = (value - n1) / (n2 - n1)
  const scaled = n3 + normalized * (n4 - n3)
  return Math.max(Math.min(scaled, n4), n3)
}

export default async function Image(props: Props) {
  const {
    title,
    backgroundColor = 'white',
    width = 1200,
    height = 630,
    textColor,
  } = props

  const interBold = fetch(
    new URL('../fonts/Inter-Bold.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer())

  const size = scale(height, 48, 630, 48, 160)
  const fontSize = scale(height, 48, 630, 30, 36)

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col items-center justify-center"
        style={{
          backgroundColor,
          color: textColor[1] || 'black',
        }}
      >
        <div
          tw="flex flex-none items-center justify-center bg-orange-500"
          style={{
            fontSize: `${fontSize}px`,
            width: `${size}px`,
            height: `${size}px`,
            maskImage: `url(${generateBase64({ width: size, height: size, n: 4 })})`,
            maskSize: '100% 100%',
            color: textColor[0] || 'white',
          }}
        >
          {size === 48 ? process.env.SITE_NAME!.charAt(0) : process.env.SITE_NAME}
        </div>
        {title && <p tw="mt-12 text-6xl font-bold">{title}</p>}
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: await interBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
}
