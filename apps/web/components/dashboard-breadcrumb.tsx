'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@repo/i18n/client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb'

export default function DashboardBreadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  const items = paths.slice(paths.findIndex((item) => item === 'dashboard') + 1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {items.map((item, index) =>
          index === items.length - 1 ? (
            <BreadcrumbItem key={item}>
              <BreadcrumbPage className="capitalize">{item}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem key={item}>
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
  )
}
