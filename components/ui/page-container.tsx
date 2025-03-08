import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 
   * Use padding of 3rem (p-12) in mobile view 
   * @default true
   */
  mobilePadding?: boolean;
}

/**
 * Standard container for page content with responsive padding
 */
export function PageContainer({ 
  children, 
  className, 
  mobilePadding = true, 
  ...props 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto space-y-8", 
        mobilePadding ? "p-12 md:px-4 md:py-6" : "px-4 py-6", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
