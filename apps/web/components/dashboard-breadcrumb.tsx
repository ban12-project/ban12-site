'use client';

import { Link } from '@repo/i18n/client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import { cn } from '@repo/ui/lib/utils';
import { usePathname } from 'next/navigation';

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  const items = paths.slice(paths.indexOf('dashboard') + 1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          className={cn(items.length > 0 ? 'hidden md:block' : 'hidden')}
        />
        {items.map((item, index) =>
          index === items.length - 1 ? (
            <BreadcrumbItem key={item} className="hidden md:block">
              <BreadcrumbPage className="capitalize">{item}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem key={item} className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/${item}`} className="capitalize">
                  {item}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
