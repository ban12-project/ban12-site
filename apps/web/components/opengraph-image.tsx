import { ImageResponse } from 'next/og'

type Props = {
  title?: string
  width?: number
  height?: number
  backgroundColor?: string
}

function scale(value: number, n1: number, n2: number, n3: number, n4: number) {
  const normalized = (value - n1) / (n2 - n1)
  const scaled = n3 + normalized * (n4 - n3)
  return Math.max(Math.min(scaled, n4), n3)
}

export default async function Image(props: Props) {
  const { title, backgroundColor = 'white', width = 1200, height = 630 } = props

  const interBold = fetch(
    new URL('../fonts/Inter-Bold.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer())

  const borderWidth = scale(height, 48, 630, 2, 6)
  const borderRadius = scale(height, 48, 630, 4, 24)
  const size = scale(height, 48, 630, 30, 160)

  return new ImageResponse(
    (
      <div
        tw={`flex h-full w-full flex-col items-center justify-center bg-${backgroundColor || 'white'}`}
      >
        <div
          tw="flex flex-none items-center justify-center border border-orange-500"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderWidth: `${borderWidth}px`,
            borderRadius: `${borderRadius}px`,
            transform: 'rotate(36deg)',
          }}
        ></div>
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
