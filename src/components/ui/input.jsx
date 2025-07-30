import React from "react"
    import { cn } from "@/lib/utils"

    const Input = React.forwardRef(({ className, type, ...props }, ref) => {
      return (
        (<input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border-2 border-field-border bg-field-background px-3 py-2 text-sm text-field-text ring-offset-app-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-app-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:border-app-primary focus-visible:shadow-[0_0_0_3px_var(--field-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            className
          )}
          ref={ref}
          {...props} />)
      );
    })
    Input.displayName = "Input"

    export { Input }