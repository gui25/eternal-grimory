import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ icon: Icon, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-6", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-6 w-6 text-gold" />}
        <h2 className="fantasy-subheading">{title}</h2>
      </div>
      {description && <div className="text-xs text-gold-light/70 sm:ml-2">{description}</div>}
    </div>
  );
}
