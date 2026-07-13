import * as React from "react"

import { cn } from "@/lib/utils"
import { controlBase } from "@/components/form/fieldStyles"

/**
 * Textarea — Forms & Utility reference §03. Shares `controlBase` with every other control, so its
 * default / focus / error / disabled states are identical. Vertically resizable, as in the reference.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlBase, "min-h-24 resize-y leading-[1.55]", className)}
      {...props}
    />
  )
}

export { Textarea }
