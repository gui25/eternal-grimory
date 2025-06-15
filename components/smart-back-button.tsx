"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSmartBackButton } from "@/hooks/use-navigation-history";

interface SmartBackButtonProps {
  backLink: string;
  backLabel: string;
  className?: string;
}

export default function SmartBackButton({ 
  backLink, 
  backLabel, 
  className,
}: SmartBackButtonProps) {
  const router = useRouter();
  const { 
    buttonText, 
    useSpecificLink, 
    cameFromListingPage, 
    prevPath,
    navigationHistory 
  } = useSmartBackButton(backLink, backLabel);

  const handleBack = () => {
    console.log('🔙 Back button clicked:', {
      useSpecificLink,
      backLink,
      prevPath,
      action: useSpecificLink ? 'router.push()' : 'router.back()'
    });

    if (useSpecificLink) {
      router.push(backLink);
    } else {
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
        <span>{buttonText}</span>
      </Button>
    </div>
  );
} 