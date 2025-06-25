import { SessionProvider } from 'next-auth/react'

import { auth } from './auth'

type Props = Readonly<{
  children: React.ReactNode
}>

export const dynamic = 'force-dynamic'

export default async function AuthLayout({ children }: Props) {
  const session = await auth()

  return <SessionProvider session={session}>{children}</SessionProvider>
}
