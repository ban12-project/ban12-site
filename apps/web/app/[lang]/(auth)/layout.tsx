import { SessionProvider } from 'next-auth/react'

type Props = Readonly<{
  children: React.ReactNode
}>

export default function AuthLayout({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>
}
