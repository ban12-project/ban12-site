import { Suspense } from 'react'
import { SessionProvider } from 'next-auth/react'

import { auth } from './auth'

type Props = Readonly<{
  children: React.ReactNode
}>

export default async function AuthLayout({ children }: Props) {
  return (
    <Suspense>
      <Dynamic>{children}</Dynamic>
    </Suspense>
  )
}

async function Dynamic({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return <SessionProvider session={session}>{children}</SessionProvider>
}
