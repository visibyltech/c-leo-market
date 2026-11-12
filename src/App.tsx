/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CartDrawer } from './components/CartDrawer';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { ProductDetailsView } from './views/ProductDetailsView';
import { WishlistView } from './views/WishlistView';
import { AccountView } from './views/AccountView';
import { AdminView } from './views/AdminView';
import { PolicyView } from './views/PolicyView';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { page } = useNavigation();
  const { toasts } = useShop();

  const renderActiveView = () => {
    switch (page) {
      case 'home':
        return <HomeView />;
      case 'category':
      case 'search':
        return <CategoryView />;
      case 'product-details':
        return <ProductDetailsView />;
      case 'wishlist':
        return <WishlistView />;
      case 'account':
        return <AccountView />;
      case 'admin':
        return <AdminView />;
      case 'about':
      case 'contact':
      case 'faq':
      case 'policy':
        return <PolicyView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#0B4FD8] selection:text-white relative">
      {/* Universal Header with Brand Logo, Search & Cart Badges */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 w-full">{renderActiveView()}</main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Mobile Fixed 5-Item Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />

      {/* Floating Toast Feedback Notifications */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700/60 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <ShopProvider>
        <MainLayout />
      </ShopProvider>
    </NavigationProvider>
  );
}
