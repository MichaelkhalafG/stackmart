import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — Forms & Utility reference §03.
 *
 * Variants map 1:1 to the reference row:
 *   default (primary) navy fill, white text, deepens to navy-depth on hover
 *   outline/secondary white on canvas, navy text, border firms to navy on hover
 *   ghost             royal-blue text, lavender wash on hover
 *   destructive       solid danger fill, white text
 *   link              royal-blue underline
 * Plus disabled (canvas-subtle, muted, not-allowed) and a `loading` state with a spinner.
 *
 * `loading` disables the button, shows a spinner before the label and announces `aria-busy`.
 * The spinner respects prefers-reduced-motion via the global reduced-motion rule.
 */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-semibold whitespace-nowrap",
    "transition-[background-color,border-color,box-shadow,color] duration-150 outline-none select-none",
    "focus-visible:ring-[3px] focus-visible:ring-accent/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-canvas-subtle disabled:text-fg-muted",
    "aria-disabled:cursor-not-allowed aria-disabled:border-border aria-disabled:bg-canvas-subtle aria-disabled:text-fg-muted",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:bg-primary-emphasis",
        outline:
          "border-border bg-canvas text-primary hover:border-primary hover:bg-canvas-subtle",
        secondary:
          "border-border bg-canvas text-primary hover:border-primary hover:bg-canvas-subtle",
        ghost: "border-transparent bg-transparent text-accent hover:bg-tag-bg",
        destructive: "border-danger bg-danger text-canvas hover:brightness-95",
        link: "border-transparent bg-transparent text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[14.5px]",
        sm: "h-9 px-4 text-sm",
        xs: "h-8 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 text-[15px]",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/** The reference's loading spinner: a 2px ring with one bright arc. */
function ButtonSpinner() {
  return (
    <span
      aria-hidden
      className="anim-spin-ring size-3.5 rounded-full border-2 border-current/40 border-t-current"
    />
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  block,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, disables interaction and sets aria-busy. */
    loading?: boolean
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    >
      {loading ? <ButtonSpinner /> : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
