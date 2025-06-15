import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import TrackView from "@/components/track-view";
import SmartBackButton from "@/components/smart-back-button";

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
  trackViewItem,
  className,
  mobilePadding = true,
}: DetailPageLayoutProps) {
  return (
    <PageContainer className={`max-w-3xl mx-auto ${className || ""}`} mobilePadding={mobilePadding}>
      {/* Track this page view */}
      <TrackView item={trackViewItem} />

      {/* Smart Back button */}
      <div className="mb-6">
        <SmartBackButton 
          backLink={backLink} 
          backLabel={backLabel} 
          showDebug={true}
        />
      </div>

      {/* Entity header with optional image */}
      <div className="mb-8 fantasy-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image section */}
          {image ? (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                <Image src={image} alt={imageAlt || title} fill className="object-cover" />
              </div>
            </div>
          ) : (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold-dark bg-wine-darker flex items-center justify-center">
                {imagePlaceholder}
              </div>
            </div>
          )}

          {/* Title and metadata section */}
          <div className="flex-1">
            <h1 className="fantasy-heading mb-2">{title}</h1>
            {metadata && <div className="mb-3">{metadata}</div>}
          </div>
        </div>

        {/* Optional description */}
        {description && (
          <div className="mt-4 italic text-gray-300">"{description}"</div>
        )}
      </div>

      {/* Main content */}
      {children}
    </PageContainer>
  );
} 