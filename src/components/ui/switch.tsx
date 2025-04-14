"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(
    checked !== undefined ? checked : defaultChecked || false
  )

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    if (checked === undefined) {
      setIsChecked(newChecked)
    }
    onCheckedChange?.(newChecked)
  }

  return (
    <label
      className={cn(
        "inline-flex items-center cursor-pointer relative",
        className
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isChecked}
        onChange={handleToggle}
        ref={ref}
        {...props}
      />
      <div className={cn(
        "w-11 h-6 bg-input rounded-full peer",
        "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2",
        "peer-checked:after:translate-x-5 peer-checked:bg-primary",
        "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
        "after:bg-white after:rounded-full after:h-5 after:w-5",
        "after:transition-all after:duration-300 ease-in-out"
      )} />
    </label>
  )
})

Switch.displayName = "Switch"

export { Switch }
