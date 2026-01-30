'use client';

import { Link } from '@repo/i18n/client';
import { Button } from '@repo/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { Menu, X } from 'lucide-react';
import * as React from 'react';
import type { Messages } from '#/lib/i18n';

type MenuItem = {
  title: string;
  children: {
    title: string;
    href: string;
    icon: string;
    description: string | null;
  }[];
};

export function MobileNav({
  dict,
  menuItems,
}: {
  dict: Messages;
  menuItems: MenuItem[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-2 text-dark hover:bg-dark/5 rounded-full transition-colors"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] mr-4 p-0 max-h-[80vh] overflow-y-auto"
          align="end"
        >
          <div className="p-4 bg-white rounded-lg shadow-xl flex flex-col gap-6">
            {menuItems.map((item) => (
              <div key={item.title} className="space-y-3">
                <h3 className="font-bold text-lg text-dark border-b pb-2">
                  {dict.nav_sections[
                    item.title as keyof typeof dict.nav_sections
                  ]?.title || item.title}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={child.href}
                      className="text-dark/70 hover:text-primary py-1 px-2 rounded hover:bg-black/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Button
              className="w-full mt-4"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/eligibility">{dict.nav.check_eligibility}</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
