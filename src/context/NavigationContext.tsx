import React, { createContext, useContext, useEffect, useState } from 'react';
import { CategorySlug, PageView } from '../types';

export interface NavigationState {
  page: PageView;
  selectedCategory?: CategorySlug | null;
  selectedProductId?: string | null;
  searchQuery?: string;
  policyType?: 'privacy' | 'terms' | 'refund';
  adminInitialTab?: 'analytics' | 'products' | 'orders' | 'bnpl' | 'payments';
  accountInitialTab?: 'orders' | 'bnpl' | 'saved' | 'profile';
}

interface NavigationContextType extends NavigationState {
  navigateTo: (page: PageView, options?: Partial<Omit<NavigationState, 'page'>>) => void;
  goBack: () => void;
  openProduct: (productId: string) => void;
  openCategory: (category: CategorySlug) => void;
  openSearch: (query: string) => void;
  openPolicy: (type: 'privacy' | 'terms' | 'refund') => void;
  historyLength: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navState, setNavState] = useState<NavigationState>(() => {
    // Check if initial deep link exists in URL hash or query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const product = params.get('product');
      const category = params.get('category') as CategorySlug | null;
      if (product) {
        return { page: 'product-details', selectedProductId: product };
      }
      if (category) {
        return { page: 'category', selectedCategory: category };
      }
    }
    return { page: 'home' };
  });

  const [historyStack, setHistoryStack] = useState<NavigationState[]>([{ page: 'home' }]);

  // Synchronize with browser history and handle Android hardware back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setNavState(event.state);
        setHistoryStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
      } else {
        // Fallback to home if root popped
        setNavState({ page: 'home' });
      }
    };

    // Ensure initial entry has state
    if (window.history.state === null) {
      window.history.replaceState({ page: 'home' }, '', window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: PageView, options?: Partial<Omit<NavigationState, 'page'>>) => {
    const nextState: NavigationState = {
      page,
      selectedCategory: options?.selectedCategory || null,
      selectedProductId: options?.selectedProductId || null,
      searchQuery: options?.searchQuery || '',
      policyType: options?.policyType || 'privacy',
      adminInitialTab: options?.adminInitialTab,
      accountInitialTab: options?.accountInitialTab,
    };

    let newUrl = window.location.pathname;
    if (page === 'home') newUrl = '/';
    else if (page === 'product-details' && options?.selectedProductId) {
      newUrl = `?product=${options.selectedProductId}`;
    } else if (page === 'category' && options?.selectedCategory) {
      newUrl = `?category=${options.selectedCategory}`;
    } else {
      newUrl = `?view=${page}`;
    }

    try {
      window.history.pushState(nextState, '', newUrl);
    } catch {
      // Ignore security errors in restricted iframe
    }

    setNavState(nextState);
    setHistoryStack((prev) => [...prev, nextState]);

    // Scroll smoothly to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const goBack = () => {
    if (window.history.length > 1 && historyStack.length > 1) {
      window.history.back();
    } else {
      // Direct graceful fallback to home if stack is empty
      navigateTo('home');
    }
  };

  const openProduct = (productId: string) => {
    navigateTo('product-details', { selectedProductId: productId });
  };

  const openCategory = (category: CategorySlug) => {
    navigateTo('category', { selectedCategory: category });
  };

  const openSearch = (query: string) => {
    navigateTo('search', { searchQuery: query });
  };

  const openPolicy = (type: 'privacy' | 'terms' | 'refund') => {
    navigateTo('policy', { policyType: type });
  };

  return (
    <NavigationContext.Provider
      value={{
        ...navState,
        navigateTo,
        goBack,
        openProduct,
        openCategory,
        openSearch,
        openPolicy,
        historyLength: historyStack.length,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
};
