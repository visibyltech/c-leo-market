import React from 'react';
import { Home, Grid, Heart, ShoppingCart, User } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav: React.FC = () => {
  const { page, navigateTo } = useNavigation();
  const { cartCount, wishlistCount, setIsCartDrawerOpen } = useShop();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            page === 'home' ? 'text-[#0B4FD8]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {page === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0B4FD8] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 ${page === 'home' ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
        </button>

        {/* 2. Categories */}
        <button
          onClick={() => navigateTo('category')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            page === 'category' ? 'text-[#0B4FD8]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Grid className="w-5 h-5" />
            {page === 'category' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0B4FD8] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 ${page === 'category' ? 'font-bold' : 'font-medium'}`}>
            Categories
          </span>
        </button>

        {/* 3. Wishlist */}
        <button
          onClick={() => navigateTo('wishlist')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            page === 'wishlist' ? 'text-[#0B4FD8]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
            {page === 'wishlist' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0B4FD8] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 ${page === 'wishlist' ? 'font-bold' : 'font-medium'}`}>
            Wishlist
          </span>
        </button>

        {/* 4. Cart */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            page === 'cart' ? 'text-[#0B4FD8]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Cart</span>
        </button>

        {/* 5. Account */}
        <button
          onClick={() => navigateTo('account')}
          className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
            page === 'account' ? 'text-[#0B4FD8]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {page === 'account' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0B4FD8] rounded-full" />
            )}
          </div>
          <span className={`text-[10px] mt-1 ${page === 'account' ? 'font-bold' : 'font-medium'}`}>
            Account
          </span>
        </button>
      </div>
    </nav>
  );
};
