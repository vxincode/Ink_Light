"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onCheckedChange?.(!checked)
      onClick?.(e)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        className={cn(
          "peer inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ backgroundColor: checked ? 'rgb(201, 169, 98)' : 'rgb(228, 225, 219)' }}
        onClick={handleClick}
        {...props}
      >
        <span
          className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
