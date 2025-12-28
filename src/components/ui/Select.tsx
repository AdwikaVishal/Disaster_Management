import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Context-based implementation to avoid full Radix dependency for now, 
// matching the requested API structure.

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export const Select = ({
    children,
    value,
    onValueChange
}: {
    children: React.ReactNode
    value: string
    onValueChange: (value: string) => void
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block w-full text-left">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <button
            type="button"
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    // This is a simplified version. In a real app, you'd map value back to label or use children type checks.
    // For this demo, we might rely on the selected item rendering or just showing the value string if label logic isn't passed.
    // To keep it robust without children inspection:
    return <span>{context.value || placeholder}</span>
}

export const SelectContent = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    if (!context.open) return null

    return (
        <div className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
            className
        )}>
            <div className="p-1">
                {children}
            </div>
        </div>
    )
}

export const SelectItem = ({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <div
            onClick={() => {
                context.onValueChange(value)
                context.setOpen(false)
            }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                className
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
}
