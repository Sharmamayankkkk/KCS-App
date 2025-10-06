import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292F36] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#292F36] text-[#FAF5F1] hover:bg-[#292F36]/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-[#A41F13] text-[#FAF5F1] hover:bg-[#A41F13]/90 shadow-sm hover:shadow-md",
        outline:
          "border border-[#E0DBD8] bg-[#FAF5F1] hover:bg-[#E0DBD8] hover:text-[#292F36]",
        secondary:
          "bg-[#E0DBD8] text-[#292F36] hover:bg-[#E0DBD8]/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-[#E0DBD8] hover:text-[#292F36]",
        link: "text-[#292F36] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }