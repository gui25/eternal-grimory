"use client"

import React from "react"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterOption[]
  placeholder?: string
  icon?: React.ReactNode
  containerClassName?: string
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ options, placeholder = "Selecionar...", icon, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <select
          ref={ref}
          className={cn(
            "border border-gold-dark rounded-md py-2 px-3 bg-wine-darker text-gold-light appearance-none pr-8 w-full",
            "focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary",
            "transition-colors duration-200",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-2.5 pointer-events-none text-gold-light">
          {icon || <Filter className="h-4 w-4" />}
        </div>
      </div>
    )
  },
)

FilterSelect.displayName = "FilterSelect"

export { FilterSelect }

