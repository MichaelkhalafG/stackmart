import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"
import { controlBase } from "@/components/form/fieldStyles"

/**
 * Text input — Forms & Utility reference §03.
 *
 * Styling comes from the shared `controlBase`, so input / textarea / select / money all share ONE
 * default, focus (royal-blue ring), error and disabled treatment. The error state is driven by
 * `aria-invalid`, which `Field` sets for you.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        controlBase,
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg",
        className
      )}
      {...props}
    />
  )
}

export { Input }
