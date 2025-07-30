import React from "react"
    import * as TabsPrimitive from "@radix-ui/react-tabs"

    import { cn } from "@/lib/utils"

    const Tabs = TabsPrimitive.Root

    const TabsList = React.forwardRef(({ className, ...props }, ref) => (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex h-auto items-center justify-center rounded-lg bg-app-surface p-1 text-app-text shadow-sm",
          "flex-wrap sm:flex-nowrap overflow-x-auto", /* Responsividade */
          className
        )}
        {...props} />
    ))
    TabsList.displayName = TabsPrimitive.List.displayName

    const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-app-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-app-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-app-surface data-[state=inactive]:text-app-text hover:bg-app-primary/10 hover:text-app-primary",
          "flex-shrink-0", /* Para responsividade */
          className
        )}
        {...props} />
    ))
    TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

    const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          "mt-2 ring-offset-app-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2",
          className
        )}
        {...props} />
    ))
    TabsContent.displayName = TabsPrimitive.Content.displayName

    export { Tabs, TabsList, TabsTrigger, TabsContent }