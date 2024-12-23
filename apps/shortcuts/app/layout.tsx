import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
  openGraph: {
    images: 'https://ban12.com/api/og',
  },
  icons: {
    icon: {
      url: new URL(
        '/api/og?w=48&h=48&bg=transparent',
        process.env.NEXT_PUBLIC_HOST_URL!,
      ),
      type: 'image/png',
    },
    shortcut: {
      url: new URL(
        '/api/og?w=192&h=192&bg=transparent',
        process.env.NEXT_PUBLIC_HOST_URL!,
      ),
      type: 'image/png',
    },
    apple: [
      {
        url: new URL(
          '/api/og?w=64&h=64&bg=transparent',
          process.env.NEXT_PUBLIC_HOST_URL!,
        ),
        type: 'image/png',
      },
      {
        url: new URL(
          '/api/og?w=180&h=180&bg=transparent',
          process.env.NEXT_PUBLIC_HOST_URL!,
        ),
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: new URL(
        '/api/og?w=180&h=180&bg=transparent',
        process.env.NEXT_PUBLIC_HOST_URL!,
      ),
    },
  },
}

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children
}
