'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import {
  BookOpen,
  Bot,
  Frame,
  Layers2,
  LifeBuoy,
  MapIcon,
  PieChart,
  Send,
  Settings,
} from 'lucide-react';
import type { User } from 'next-auth';
import type * as React from 'react';

import { NavMain } from '#/components/nav-main';
import { NavUser } from '#/components/nav-user';

const data = {
  navMain: [
    {
      title: 'Shortcut',
      url: '/dashboard/shortcut',
      icon: Layers2,
    },
    {
      title: 'Album',
      url: '/dashboard/album',
      icon: Bot,
    },
    {
      title: 'Collection',
      url: '/dashboard/collection',
      icon: BookOpen,
    },
    {
      title: 'IndexNow',
      url: '/dashboard/index-now',
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: MapIcon,
    },
  ],
};
export function AppSidebar({
  user,
  signOut,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NoNullFields<User>;
  signOut: () => void;
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Layers2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {process.env.NEXT_PUBLIC_SITE_NAME}
                  </span>
                  <span className="truncate text-xs">
                    {process.env.NEXT_PUBLIC_HOST_URL}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} signOut={signOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
