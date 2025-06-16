"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Global navigation history to persist across component unmounts
let globalNavigationHistory: string[] = [];

/**
 * Modern navigation history hook using Next.js App Router native APIs
 * Based on the official Next.js team recommendations for tracking route changes
 * Reference: https://github.com/vercel/next.js/discussions/41934
 */
export const useNavigationHistoryInitializer = () => {
  const pathname = usePathname();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Construct full URL with search params - usando window.location.search em vez de useSearchParams
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    const currentUrl = pathname + searchParams;
    
    // Get current history from sessionStorage first (in case it was updated by MDX links)
    const storage = globalThis?.sessionStorage;
    let currentHistory = [...globalNavigationHistory];
    
    if (storage) {
      try {
        const storedHistory = storage.getItem("navigationHistory");
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (parsedHistory.length > currentHistory.length) {
            // SessionStorage has more recent data (likely from MDX navigation)
            currentHistory = parsedHistory;
            globalNavigationHistory = [...parsedHistory];
          }
        }
      } catch (e) {
        console.warn('Failed to parse navigation history from sessionStorage');
      }
    }
    
    // Add to history if it's different from the last entry
    const lastEntry = currentHistory[currentHistory.length - 1];
    if (lastEntry !== currentUrl) {
      currentHistory.push(currentUrl);
      // Keep only last 10 entries to prevent memory issues
      if (currentHistory.length > 10) {
        currentHistory = currentHistory.slice(-10);
      }
      
      // Update both global and sessionStorage
      globalNavigationHistory = [...currentHistory];
      if (storage) {
        storage.setItem("navigationHistory", JSON.stringify(currentHistory));
      }
    }
    
    console.log('🔄 Navigation tracked:', {
      currentUrl,
      history: currentHistory,
      previous: currentHistory[currentHistory.length - 2] || null,
      source: 'usePathname'
    });
    
  }, [pathname]); // Removido searchParams da dependência

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
 * @param backLabel - The label for the specific back link (kept for compatibility)
 * @returns Object with navigation state and handlers
 */
export const useSmartBackButton = (backLink: string, backLabel: string) => {
  const [navigationState, setNavigationState] = useState(() => getNavigationHistory());
  
  // Update state when navigation changes - reduced frequency
  useEffect(() => {
    const updateState = () => {
      const newState = getNavigationHistory();
      // Only update if there's actually a change
      setNavigationState(prevState => {
        if (prevState.prevPath !== newState.prevPath || 
            prevState.currentPath !== newState.currentPath ||
            prevState.fullHistory.length !== newState.fullHistory.length) {
          return newState;
        }
        return prevState;
      });
    };
    
    // Update immediately
    updateState();
    
    // Set up interval to check for changes (reduced frequency)
    const interval = setInterval(updateState, 500);
    
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
    fullHistory: navigationState.fullHistory
  });
  
  return {
    // If we came from the listing page OR prevPath is null, use specific link
    useSpecificLink: shouldUseSpecificLink,
    backLink,
    prevPath,
    cameFromListingPage,
    navigationHistory: navigationState.fullHistory
  };
}; 