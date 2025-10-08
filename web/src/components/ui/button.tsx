import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'h-10 w-10 p-0',
      },
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md',
        outline:
          'border border-primary text-primary bg-transparent hover:bg-primary/5 hover:shadow-sm',
        ghost: 'text-foreground hover:bg-foreground/5 hover:shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80 p-0 h-auto',
      },
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
}

export { Button, buttonVariants }
