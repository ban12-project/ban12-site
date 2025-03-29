import * as React from 'react'
import { cn } from '@repo/ui/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const inputVariants = cva('flex h-10 w-full rounded-md px-3 py-2', {
  variants: {
    variant: {
      default:
        'border border-slate-200 bg-white text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300',
      ios: 'border-none bg-gray-400/20 outline-hidden transition-[background-color] active:bg-gray-400/30 dark:bg-gray-500/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = ({
  ref,
  className,
  variant,
  type,
  ...props
}: InputProps & {
  ref: React.RefObject<HTMLInputElement>
}) => {
  return (
    <input
      type={type}
      className={cn(
        inputVariants({
          variant,
          className,
        }),
      )}
      ref={ref}
      {...props}
    />
  )
}
Input.displayName = 'Input'

export { Input, inputVariants }
