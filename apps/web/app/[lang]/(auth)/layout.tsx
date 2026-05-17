import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';

import { auth } from './auth';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: Props) {
  return (
    <Suspense>
      <Suspended>{children}</Suspended>
    </Suspense>
  );
}

async function Suspended({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
