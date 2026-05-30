'use client';

import { Button } from '@repo/ui/components/button';
import { useMediaQuery } from '@repo/ui/hooks/use-media-query';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Drawer } from 'vaul';

export default function PageDrawer({
  children,
  closeLabel,
  title,
  description,
}: {
  children: React.ReactNode;
  closeLabel: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();

  const onAnimationEnd: React.ComponentProps<
    typeof Drawer.Root
  >['onAnimationEnd'] = (open) => {
    if (!open) router.back();
  };

  return (
    <Drawer.Root
      direction={isDesktop ? 'right' : 'bottom'}
      open={open}
      onOpenChange={setOpen}
      onAnimationEnd={onAnimationEnd}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed z-50 flex flex-col border border-white/25 bg-background/72 shadow-2xl shadow-black/20 saturate-150 backdrop-blur-2xl outline-none dark:border-white/10 dark:bg-background/62 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:left-0 data-[vaul-drawer-direction=bottom]:right-0 data-[vaul-drawer-direction=bottom]:h-[82dvh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=right]:bottom-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:top-0 data-[vaul-drawer-direction=right]:w-[min(560px,42vw)]">
          {!isDesktop && (
            <div className="mx-auto mt-3 h-1.5 w-20 shrink-0 rounded-full bg-muted" />
          )}
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {description}
          </Drawer.Description>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/60 backdrop-blur-xl"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
          >
            <X />
          </Button>
          <div className="flex-1 overflow-auto [&>*]:pb-safe-max-4 [&>*]:pt-4">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
