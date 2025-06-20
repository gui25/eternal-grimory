"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateForMDX, parseBRDate, formatDateForInput } from "@/utils/date-utils"

interface DateInputBRProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

export const DateInputBR: React.FC<DateInputBRProps> = ({
  value,
  onChange,
  placeholder = "Selecione uma data",
  className,
  disabled,
  required,
  id
}) => {
  const [internalValue, setInternalValue] = useState("")
  const [displayValue, setDisplayValue] = useState("")
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Converter valor inicial
  useEffect(() => {
    if (value) {
      // Se value é uma data em formato ISO (YYYY-MM-DD)
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setInternalValue(value)
        const date = new Date(value + 'T00:00:00')
        setDisplayValue(formatDateForMDX(date))
      } 
      // Se value é uma data em formato brasileiro
      else {
        const parsedDate = parseBRDate(value)
        if (parsedDate) {
          setInternalValue(formatDateForInput(parsedDate))
          setDisplayValue(value)
        } else {
          setInternalValue("")
          setDisplayValue("")
        }
      }
    } else {
      setInternalValue("")
      setDisplayValue("")
    }
  }, [value])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value // YYYY-MM-DD
    setInternalValue(dateValue)
    
    if (dateValue) {
      // Converter para formato brasileiro para exibição
      const date = new Date(dateValue + 'T00:00:00')
      const brFormat = formatDateForMDX(date)
      setDisplayValue(brFormat)
      
      // Retornar o valor em formato brasileiro para o formulário
      if (onChange) {
        onChange(brFormat)
      }
    } else {
      setDisplayValue("")
      if (onChange) {
        onChange("")
      }
    }
  }

  const handleClick = () => {
    if (!disabled && dateInputRef.current) {
      dateInputRef.current.focus()
      dateInputRef.current.showPicker?.()
    }
  }

  return (
    <div className="relative">
      {/* Input customizado que simula o shadcn/ui Input */}
      <div
        onClick={handleClick}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background cursor-pointer",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
                 <span 
           className="flex-1 text-left"
           style={{ 
             color: displayValue ? "hsl(40, 80%, 65%)" : undefined 
           }}
         >
           {displayValue || (
             <span className="text-muted-foreground">{placeholder}</span>
           )}
         </span>
        <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
      </div>
      
      {/* Input de data real, completamente oculto */}
      <input
        ref={dateInputRef}
        type="date"
        value={internalValue}
        onChange={handleDateChange}
        disabled={disabled}
        required={required}
        className="sr-only"
        tabIndex={-1}
        id={id}
      />
    </div>
  )
}

DateInputBR.displayName = "DateInputBR" 