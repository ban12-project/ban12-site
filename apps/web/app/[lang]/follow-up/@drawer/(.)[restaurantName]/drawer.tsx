'use client';

import { Button } from '@repo/ui/components/button';
import { useMediaQuery } from '@repo/ui/hooks/use-media-query';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';

const CLOSE_FALLBACK_MS = 360;

export default function PageDrawer({
  children,
  closeLabel,
  routeKey,
  title,
  description,
}: {
  children: React.ReactNode;
  closeLabel: string;
  routeKey: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const closeCommittedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const clearCloseTimer = useCallback(() => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const finishClose = useCallback(() => {
    if (closeCommittedRef.current) return;
    closeCommittedRef.current = true;
    clearCloseTimer();
    router.back();
  }, [clearCloseTimer, router]);

  const requestClose = useCallback(() => {
    closeCommittedRef.current = false;
    setOpen(false);
    clearCloseTimer();
    closeTimerRef.current = setTimeout(finishClose, CLOSE_FALLBACK_MS);
  }, [clearCloseTimer, finishClose]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        closeCommittedRef.current = false;
        clearCloseTimer();
        setOpen(true);
        return;
      }

      requestClose();
    },
    [clearCloseTimer, requestClose],
  );

  useEffect(() => {
    const hasRouteKey = routeKey.length > 0;

    closeCommittedRef.current = false;
    clearCloseTimer();
    if (hasRouteKey) setOpen(true);

    return clearCloseTimer;
  }, [clearCloseTimer, routeKey]);

  const onAnimationEnd: React.ComponentProps<
    typeof Drawer.Root
  >['onAnimationEnd'] = (nextOpen) => {
    if (!nextOpen && !openRef.current) finishClose();
  };

  if (!mounted) return null;

  return (
    <Drawer.Root
      direction={isDesktop ? 'right' : 'bottom'}
      open={open}
      onOpenChange={handleOpenChange}
      onAnimationEnd={onAnimationEnd}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/25" />
        <Drawer.Content className="fixed z-50 flex flex-col border border-white/25 bg-background/82 shadow-xl shadow-black/15 saturate-150 backdrop-blur-xl outline-none dark:border-white/10 dark:bg-background/72 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:left-0 data-[vaul-drawer-direction=bottom]:right-0 data-[vaul-drawer-direction=bottom]:h-[82dvh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=right]:bottom-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:top-0 data-[vaul-drawer-direction=right]:w-[min(560px,42vw)]">
          <div className="mx-auto mt-3 h-1.5 w-20 shrink-0 rounded-full bg-muted md:hidden" />
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {description}
          </Drawer.Description>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/60 backdrop-blur-md"
            onClick={requestClose}
            aria-label={closeLabel}
          >
            <X />
          </Button>
          <div className="flex-1 overflow-auto">
            <div
              key={routeKey}
              className="fade-in slide-in-from-bottom-2 fill-mode-forwards animate-in duration-200 ease-out *:pb-safe-max-4 *:pt-3"
            >
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
