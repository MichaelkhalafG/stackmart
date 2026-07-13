"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Field label — Forms & Utility reference §03: 13px, semibold, navy. Sits above its control.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-[13px] leading-none font-semibold text-primary select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
