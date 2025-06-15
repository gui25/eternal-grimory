"use client";

import { useNavigationHistoryInitializer } from "@/hooks/use-navigation-history";

/**
 * Navigation History Provider Component
 * This component initializes navigation history tracking across the entire app
 * Should be placed in the root layout
 */
export default function NavigationHistoryProvider() {
  // Initialize navigation history tracking
  useNavigationHistoryInitializer();
  
  // This component doesn't render anything, it just tracks navigation
  return null;
} 