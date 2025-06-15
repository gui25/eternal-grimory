"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Global navigation history to persist across component unmounts
let globalNavigationHistory: string[] = [];

/**
 * Modern navigation history hook using Next.js App Router native APIs
 * Based on the official Next.js team recommendations for tracking route changes
 * Reference: https://github.com/vercel/next.js/discussions/41934
 */
export const useNavigationHistoryInitializer = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Construct full URL with search params
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Add to global history if it's different from the last entry
    const lastEntry = globalNavigationHistory[globalNavigationHistory.length - 1];
    if (lastEntry !== currentUrl) {
      globalNavigationHistory.push(currentUrl);
      // Keep only last 10 entries to prevent memory issues
      if (globalNavigationHistory.length > 10) {
        globalNavigationHistory = globalNavigationHistory.slice(-10);
      }
    }
    
    // Also store in sessionStorage for persistence
    const storage = globalThis?.sessionStorage;
    if (storage) {
      storage.setItem("navigationHistory", JSON.stringify(globalNavigationHistory));
    }
    
    console.log('🔄 Navigation tracked:', {
      currentUrl,
      history: globalNavigationHistory,
      previous: globalNavigationHistory[globalNavigationHistory.length - 2] || null
    });
    
  }, [pathname, searchParams]);

  // Initialize from sessionStorage on first load
  useEffect(() => {
    if (!isInitializedRef.current) {
      const storage = globalThis?.sessionStorage;
      if (storage) {
        const storedHistory = storage.getItem("navigationHistory");
        if (storedHistory) {
          try {
            globalNavigationHistory = JSON.parse(storedHistory);
          } catch (e) {
            console.warn('Failed to parse navigation history from sessionStorage');
          }
        }
      }
      isInitializedRef.current = true;
    }
  }, []);
};

/**
 * Get navigation history
 */
export const getNavigationHistory = () => {
  const storage = globalThis?.sessionStorage;
  let history = globalNavigationHistory;
  
  // Try to get from sessionStorage if global is empty
  if (history.length === 0 && storage) {
    const storedHistory = storage.getItem("navigationHistory");
    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory);
        globalNavigationHistory = history;
      } catch (e) {
        console.warn('Failed to parse navigation history from sessionStorage');
      }
    }
  }

  return {
    prevPath: history[history.length - 2] || null,
    currentPath: history[history.length - 1] || null,
    fullHistory: history
  };
};

/**
 * Smart back button hook that determines navigation behavior
 * @param backLink - The specific link to go back to (e.g., "/characters/monsters")
 * @param backLabel - The label for the specific back link (e.g., "Voltar para Monstros")
 * @returns Object with navigation state and handlers
 */
export const useSmartBackButton = (backLink: string, backLabel: string) => {
  const [navigationState, setNavigationState] = useState(() => getNavigationHistory());
  
  // Update state when navigation changes
  useEffect(() => {
    const updateState = () => {
      setNavigationState(getNavigationHistory());
    };
    
    // Update immediately
    updateState();
    
    // Set up interval to check for changes (fallback)
    const interval = setInterval(updateState, 100);
    
    return () => clearInterval(interval);
  }, []);

  const { prevPath } = navigationState;
  
  // Check if we came from the specific listing page
  // Handle both exact match and with query parameters
  const cameFromListingPage = prevPath === backLink || prevPath?.startsWith(backLink + '?');
  
  // If prevPath is null (direct access, refresh, etc.), assume user wants to go to listing
  const shouldUseSpecificLink = cameFromListingPage || prevPath === null;
  
  console.log('🔙 Smart back button check:', {
    backLink,
    prevPath,
    cameFromListingPage,
    shouldUseSpecificLink,
    buttonText: shouldUseSpecificLink ? backLabel : "Voltar",
    fullHistory: navigationState.fullHistory
  });
  
  return {
    // If we came from the listing page OR prevPath is null, show specific label
    buttonText: shouldUseSpecificLink ? backLabel : "Voltar",
    // If we came from the listing page OR prevPath is null, use specific link
    useSpecificLink: shouldUseSpecificLink,
    backLink,
    prevPath,
    cameFromListingPage,
    navigationHistory: navigationState.fullHistory
  };
}; 