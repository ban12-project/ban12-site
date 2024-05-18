import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
}

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children
}
