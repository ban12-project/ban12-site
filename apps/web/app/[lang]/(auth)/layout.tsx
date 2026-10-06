import { Suspense } from 'react';

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
  return children;
}
