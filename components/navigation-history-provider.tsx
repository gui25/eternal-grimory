"use client";

import { Suspense } from "react";
import { useNavigationHistoryInitializer } from "@/hooks/use-navigation-history";

/**
 * Navigation History Initializer Component
 * This component initializes navigation history tracking
 */
function NavigationHistoryInitializer() {
  // Initialize navigation history tracking
  useNavigationHistoryInitializer();
  
  // This component doesn't render anything, it just tracks navigation
  return null;
}

/**
 * Navigation History Provider Component
 * This component wraps the initializer in a Suspense boundary
 * Should be placed in the root layout
 */
export default function NavigationHistoryProvider() {
  return (
    <Suspense fallback={null}>
      <NavigationHistoryInitializer />
    </Suspense>
  );
} 