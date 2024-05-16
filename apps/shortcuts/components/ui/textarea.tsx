import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

const textareaVariants = cva('flex min-h-[80px] w-full rounded-md px-3 py-2', {
  variants: {
    variant: {
      default:
        'border border-slate-200 bg-white text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300',
      ios: 'border-none bg-gray-400 bg-opacity-20 outline-none transition-[background-color] active:bg-opacity-30 dark:bg-gray-500 dark:bg-opacity-20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          textareaVariants({
            variant,
            className,
          }),
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
