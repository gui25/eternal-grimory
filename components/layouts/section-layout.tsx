import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import PageTransition from "@/components/page-transition";

interface SectionLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
  containerClassName?: string;
  transitionMode?: "fade" | "slide";
  /**
   * Use padding of 3rem (p-12) in mobile view
   * @default true
   */
  mobilePadding?: boolean;
}

/**
 * A standard layout component for section pages
 * Provides consistent structure, transitions, and spacing
 */
export function SectionLayout({
  children,
  title,
  description,
  headerContent,
  actions,
  containerClassName,
  transitionMode = "fade",
  mobilePadding = true,
}: SectionLayoutProps) {
  return (
    <PageTransition mode={transitionMode}>
      <PageContainer className={containerClassName} mobilePadding={mobilePadding}>
        {/* Section header */}
        {(title || description || headerContent || actions) && (
          <div className="mb-8 space-y-4">
            {/* Title and description */}
            {(title || description) && (
              <div>
                {title && <h1 className="fantasy-heading">{title}</h1>}
                {description && (
                  <p className="text-gold-light/80 mt-2">{description}</p>
                )}
              </div>
            )}

            {/* Header content - typically filter controls */}
            {headerContent && <div>{headerContent}</div>}

            {/* Action buttons */}
            {actions && <div className="flex justify-end">{actions}</div>}
          </div>
        )}

        {/* Main content */}
        <div>{children}</div>
      </PageContainer>
    </PageTransition>
  );
} 