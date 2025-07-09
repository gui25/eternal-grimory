import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import TrackView from "@/components/track-view";
import SmartBackButton from "@/components/smart-back-button";
import SmartImage from "@/components/ui/smart-image";

interface DetailPageLayoutProps {
  children: React.ReactNode;
  title: string;
  backLink: string;
  backLabel: string;
  image?: string;
  imageAlt?: string;
  imagePlaceholder?: React.ReactNode;
  metadata?: React.ReactNode;
  description?: string;
  date?: string;
  tags?: string[];
  actionButtons?: React.ReactNode;
  trackViewItem: {
    slug: string;
    name: string;
    type: string;
    category: string;
    date?: string;
    rarity?: string;
  };
  className?: string;
  /**
   * Use padding of 3rem (p-12) in mobile view
   * @default true
   */
  mobilePadding?: boolean;
}

export function DetailPageLayout({
  children,
  title,
  backLink,
  backLabel,
  image,
  imageAlt,
  imagePlaceholder,
  metadata,
  description,
  date,
  tags,
  actionButtons,
  trackViewItem,
  className,
  mobilePadding = true,
}: DetailPageLayoutProps) {
  return (
    <PageContainer className={`max-w-3xl mx-auto ${className || ""}`} mobilePadding={mobilePadding}>
      {/* Track this page view */}
      <TrackView item={trackViewItem} />

      {/* Smart Back button */}
      <div className="mb-6 flex items-center justify-between">
        <SmartBackButton 
          backLink={backLink} 
          backLabel={backLabel} 
          showDebug={false}
        />
        {actionButtons && (
          <div className="flex gap-2">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Entity header with optional image */}
      <div className="mb-8 fantasy-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image section */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
              <SmartImage 
                src={image} 
                alt={imageAlt || title} 
                fill 
                className="object-cover" 
                placeholder={imagePlaceholder}
              />
            </div>
          </div>

          {/* Title and metadata section */}
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <h1 className="fantasy-heading text-3xl mb-4">{title}</h1>
            
            {/* Date */}
            {date && (
              <div className="text-lg mb-4 text-gold-light flex items-center">
                <Calendar className="inline-block mr-2 h-5 w-5" />
                {date}
              </div>
            )}
            
            {/* Additional metadata (for backwards compatibility) */}
            {metadata && <div className="mb-4">{metadata}</div>}
            
            {/* Description in italics */}
            {description && (
              <p className="text-sm text-gold-light/80 italic mb-4 flex-grow">
                "{description}"
              </p>
            )}
            

          </div>
        </div>
      </div>

      {/* Main content */}
      {children}
    </PageContainer>
  );
} 