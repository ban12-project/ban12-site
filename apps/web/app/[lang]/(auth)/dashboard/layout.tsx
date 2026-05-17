import { Separator } from '@repo/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/sidebar';

import { AppSidebar } from '#/components/app-sidebar';
import Breadcrumb from '#/components/dashboard-breadcrumb';

import { auth, signOut } from '../auth';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: Props) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar
        user={session!.user!}
        signOut={async () => {
          'use server';
          await signOut();
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
