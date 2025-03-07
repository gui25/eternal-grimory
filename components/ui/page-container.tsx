import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = HTMLAttributes<HTMLDivElement>;

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-8 p-6 md:pt-6 pt-16", className)} {...props} />
    );
  }
);
