"use client"

import React, { useState } from "react"
import { Filter, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectFancyProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterOption[]
  placeholder?: string
  icon?: React.ReactNode
  containerClassName?: string
  label?: string
}

const FilterSelectFancy = React.forwardRef<HTMLSelectElement, FilterSelectFancyProps>(
  ({ options, placeholder = "Selecionar...", icon, className, containerClassName, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className={cn("relative", containerClassName)}>
        {label && <label className="block text-sm font-medium text-gold-light mb-1">{label}</label>}
        <div
          className={cn(
            "relative rounded-md transition-all duration-300",
            isFocused ? "shadow-[0_0_0_2px_rgba(255,215,0,0.3)]" : "",
          )}
        >
          {/* Glow effect when focused */}
          {isFocused && (
            <div className="absolute -inset-0.5 bg-gold-primary/20 rounded-md blur-sm animate-pulse-slow -z-10"></div>
          )}

          <select
            ref={ref}
            className={cn(
              "border border-gold-dark rounded-md py-2 px-3 bg-wine-darker text-gold-light appearance-none pr-8 w-full",
              "focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary",
              "transition-all duration-200",
              isFocused && "border-gold-primary",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-2 top-2.5 pointer-events-none text-gold-light flex items-center gap-1">
            {icon || <Filter className="h-4 w-4" />}
            <ChevronDown
              className={cn("h-3 w-3 transition-transform duration-200", isFocused ? "rotate-180" : "rotate-0")}
            />
          </div>
        </div>
      </div>
    )
  },
)

FilterSelectFancy.displayName = "FilterSelectFancy"

export { FilterSelectFancy }

