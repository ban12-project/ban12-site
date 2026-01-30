import { Link } from '@repo/i18n/client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@repo/ui/components/navigation-menu';
import * as React from 'react';
import type { Messages } from '#/lib/i18n';
import { IconMap, type IconName } from '../icon-map';

type MenuItem = {
  title: string;
  children: {
    title: string;
    href: string;
    icon: string;
    description: string | null;
  }[];
};

export function DesktopNav({
  dict,
  menuItems,
  children,
}: {
  dict: Messages;
  menuItems: MenuItem[];
  children?: React.ReactNode;
}) {
  return (
    <NavigationMenu className="hidden lg:block">
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuTrigger className="bg-transparent text-dark/80 hover:text-dark hover:bg-black/5 px-3 [&:lang(en)]:tracking-tight">
              {(dict.nav_sections as Record<string, { title: string }>)[
                item.title
              ]?.title || item.title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                {item.children.map((child) => (
                  <ListItem
                    key={child.title}
                    title={child.title}
                    href={child.href}
                    icon={
                      IconMap[child.icon as IconName] || IconMap['file-text']
                    }
                  >
                    {child.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        {React.Children.map(children, (child) => (
          <NavigationMenuItem key={child?.toString()}>
            {child}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function ListItem({
  title,
  children,
  href,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string;
  icon?: React.ElementType;
}) {
  return (
    <li {...props}>
      {href ? (
        <NavigationMenuLink asChild>
          <Link
            href={href}
            className="flex flex-row select-none gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            {Icon && <Icon className="size-6 text-muted-foreground/70" />}
            <div className="flex flex-col gap-1">
              <div className="text-base font-medium leading-none">{title}</div>
              {children && (
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {children}
                </p>
              )}
            </div>
          </Link>
        </NavigationMenuLink>
      ) : (
        <span className={navigationMenuTriggerStyle()}>title</span>
      )}
    </li>
  );
}
