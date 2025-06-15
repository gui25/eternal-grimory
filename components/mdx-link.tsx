"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MDXLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

/**
 * Custom Link component for MDX that properly tracks navigation history
 * This ensures that navigation through MDX content is captured in our history tracking
 */
export default function MDXLink({ href, className, children, ...props }: MDXLinkProps) {
  const pathname = usePathname();

  const handleClick = () => {
    // Store current path in navigation history before navigating
    const storage = globalThis?.sessionStorage;
    if (storage && href?.startsWith("/")) {
      // Get current navigation history
      let history: string[] = [];
      try {
        const storedHistory = storage.getItem("navigationHistory");
        if (storedHistory) {
          history = JSON.parse(storedHistory);
        }
      } catch (e) {
        console.warn('Failed to parse navigation history from sessionStorage');
      }

      // Add current path to history if it's different from the last entry
      const currentUrl = pathname;
      const lastEntry = history[history.length - 1];
      if (lastEntry !== currentUrl) {
        history.push(currentUrl);
        // Keep only last 10 entries
        if (history.length > 10) {
          history = history.slice(-10);
        }
        storage.setItem("navigationHistory", JSON.stringify(history));
      }

      console.log('🔗 MDX Link navigation tracked:', {
        from: currentUrl,
        to: href,
        history
      });
    }
  };

  // Internal links
  if (href?.startsWith("/")) {
    return (
      <Link 
        href={href} 
        className={cn("text-blue-600 hover:underline dark:text-blue-400", className)} 
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // External links
  return (
    <a
      href={href}
      className={cn("text-blue-600 hover:underline dark:text-blue-400", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
} 