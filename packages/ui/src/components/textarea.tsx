import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/utils"

const textareaVariants = cva("flex min-h-[80px] w-full rounded-md px-3 py-2", {
  variants: {
    variant: {
      default:
        "border border-input bg-background text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      ios: "border-none bg-gray-400/20 outline-none transition-[background-color] active:bg-gray-400/30 dark:bg-gray-500/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, variant, ...props }, ref) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
