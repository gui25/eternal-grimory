"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  placeholder?: React.ReactNode;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

/**
 * Smart Image Component
 * Automatically falls back to placeholder if image fails to load or src is empty
 * Based on Next.js Image component with error handling
 */
export default function SmartImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  placeholder,
  containerClassName,
  priority = false,
  sizes,
  quality,
  onLoad,
  onError,
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if we should show placeholder
  const shouldShowPlaceholder = !src || imageError || src.includes('/placeholder.svg');

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.(event);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setImageLoaded(false);
    onError?.(event);
  };

  // If we should show placeholder, render it
  if (shouldShowPlaceholder) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-wine-darker",
          fill ? "absolute inset-0" : "",
          !fill && width && height ? `w-[${width}px] h-[${height}px]` : "",
          containerClassName
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        {placeholder}
      </div>
    );
  }

  // Check if it's a local image that might have issues with Next/Image optimization
  const isLocalImage = src && (src.startsWith('/saved-images/') || src.startsWith('/temp-images/'));
  
  // For local images, use a regular img tag to avoid Next.js optimization issues
  if (isLocalImage) {
    return (
      <div className={cn("relative", fill ? "w-full h-full" : "", containerClassName)}>
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300 object-cover opacity-100",
            fill ? "absolute inset-0 w-full h-full" : "",
            className
          )}
          style={!fill && width && height ? { width, height } : undefined}
          onError={() => setImageError(true)}
        />
        
        {/* Show placeholder only if image errored */}
        {imageError && (
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-wine-darker"
            )}
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }

  // Render the actual image using Next/Image for external/optimized images
  return (
    <div className={cn("relative", fill ? "w-full h-full" : "", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        priority={priority}
        sizes={sizes}
        quality={quality}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Loading state - show placeholder while image is loading */}
      {!imageLoaded && !imageError && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-wine-darker transition-opacity duration-300",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
} 