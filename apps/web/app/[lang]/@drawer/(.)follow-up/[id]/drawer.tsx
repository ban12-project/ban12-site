'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Drawer } from 'vaul'

export default function PageDrawer({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  const onAnimationEnd: React.ComponentProps<
    typeof Drawer.Root
  >['onAnimationEnd'] = (open) => {
    if (!open) router.back()
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      onAnimationEnd={onAnimationEnd}
    >
      <Drawer.Portal>
        <Drawer.Title className="sr-only"></Drawer.Title>
        <Drawer.Description className="sr-only"></Drawer.Description>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 flex h-[80vh] flex-col rounded-t-[10px] outline-none">
          <div className="[&>*]:pb-safe-max-4 flex-1 overflow-auto saturate-[180%] backdrop-blur-[20px] backdrop-filter [&>*]:pt-4">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
