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
      url: 'https://ban12.com/api/og?w=48&h=48&bg=transparent',
      type: 'image/png',
    },
    shortcut: {
      url: 'https://ban12.com/api/og?w=192&h=192&bg=transparent',
      type: 'image/png',
    },
    apple: [
      {
        url: 'https://ban12.com/api/og?w=64&h=64&bg=transparent',
        type: 'image/png',
      },
      {
        url: 'https://ban12.com/api/og?w=180&h=180&bg=transparent',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: 'https://ban12.com/api/og?w=180&h=180&bg=transparent',
    },
  },
}

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children
}
