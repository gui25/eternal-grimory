"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSmartBackButton } from "@/hooks/use-navigation-history";

interface SmartBackButtonProps {
  backLink: string;
  backLabel: string;
  className?: string;
  showDebug?: boolean;
}

/**
 * Smart Back Button Component
 * Always shows "Voltar" but intelligently chooses between router.back() or router.push()
 * Based on navigation history using modern Next.js App Router APIs
 */
export default function SmartBackButton({ 
  backLink, 
  backLabel, 
  className,
  showDebug = false
}: SmartBackButtonProps) {
  const router = useRouter();
  const { useSpecificLink, prevPath, cameFromListingPage, navigationHistory } = useSmartBackButton(backLink, backLabel);

  const handleBack = () => {
    console.log('🔙 Back button clicked:', {
      useSpecificLink,
      backLink,
      prevPath,
      action: useSpecificLink ? 'router.push()' : 'router.back()'
    });

    if (useSpecificLink) {
      // Navigate to specific listing page
      router.push(backLink);
    } else {
      // Use browser back functionality
      router.back();
    }
  };

  return (
    <div>
      <Button 
        variant="rpg" 
        size="lg" 
        onClick={handleBack} 
        className={`back-button flex items-center ${className || ""}`}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Voltar</span>
      </Button>
      
      {/* Debug information - only show in development */}
      {showDebug && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-800 text-xs rounded text-white">
          <div><strong>Debug Info:</strong></div>
          <div>Previous: {prevPath || 'null'}</div>
          <div>Back Link: {backLink}</div>
          <div>Came from listing: {cameFromListingPage ? 'Yes' : 'No'}</div>
          <div>Use specific link: {useSpecificLink ? 'Yes' : 'No'}</div>
          <div>History: {JSON.stringify(navigationHistory, null, 2)}</div>
        </div>
      )}
    </div>
  );
} 