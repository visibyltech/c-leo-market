import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Bell,
  Phone,
  ShieldCheck,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';

export const Header: React.FC = () => {
  const { page, navigateTo, openProduct, openCategory, openSearch } = useNavigation();
  const {
    cartCount,
    wishlistCount,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    products,
    setIsCartDrawerOpen,
  } = useShop();

  const [searchInput, setSearchInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      openSearch(searchInput.trim());
      setIsSearchFocused(false);
    }
  };

  const matchingSuggestions = searchInput.trim().length > 1
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(searchInput.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#002B7F] text-white text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-semibold text-amber-300">C-LEO PSS:</span>
            <span className="hidden sm:inline">Pay Small Small from ₦1,000/day · Buy Now Pay Later Available</span>
            <span className="sm:hidden">Pay Small Small from ₦1,000/day</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-slate-200">
            <a
              href="tel:+2348030000000"
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Call: 0800-CLEO-PSS</span>
            </a>
            <button
              onClick={() => navigateTo('account', { accountInitialTab: 'orders' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <span className="text-blue-300">|</span>
            <button
              onClick={() => navigateTo('admin')}
              className="text-amber-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          {/* Brand Logo & Title */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left shrink-0 group cursor-pointer"
            title="Go to C-LEO Market Service Homepage"
          >
            <img
              src="/assets/aistudio/IMG-20261112-WA0029_e503f796.jpg"
              alt="C-LEO MARKET SERVICE (PSS) Official Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-xs border border-blue-600/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#0B4FD8] leading-none">
                C-LEO <span className="text-slate-900">PSS</span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-rose-600 tracking-wider uppercase mt-0.5">
                Market Service
              </span>
            </div>
          </button>

          {/* Desktop & Tablet Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search smartphones, smart TVs, solar inverters, washing machines..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-24 py-2 sm:py-2.5 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-[#0B4FD8] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 text-xs font-semibold text-white bg-[#0B4FD8] hover:bg-[#002B7F] rounded-full transition-colors"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && matchingSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Instant Product Matches
                </div>
                {matchingSuggestions.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      openProduct(prod.id);
                      setIsSearchFocused(false);
                      setSearchInput('');
                    }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50/70 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-md object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-blue-700 font-semibold tabular-nums">
                        ₦{prod.price.toLocaleString('en-NG')}
                        {prod.paySmallSmallDaily && (
                          <span className="ml-2 text-[10px] text-amber-600 font-normal">
                            PSS: ₦{prod.paySmallSmallDaily.toLocaleString('en-NG')}/day
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Notifications Menu */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-slate-700 hover:text-[#0B4FD8] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-[#002B7F] text-white flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] text-blue-200">{notifications.length} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between text-slate-800 font-semibold mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{n.date}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => navigateTo('wishlist')}
              className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                page === 'wishlist'
                  ? 'bg-blue-50 text-[#0B4FD8]'
                  : 'text-slate-700 hover:text-[#0B4FD8] hover:bg-slate-100'
              }`}
              title="Saved Items / Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account Icon */}
            <button
              onClick={() => navigateTo('account')}
              className={`p-2 rounded-full transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 ${
                page === 'account'
                  ? 'bg-blue-50 text-[#0B4FD8]'
                  : 'text-slate-700 hover:text-[#0B4FD8] hover:bg-slate-100'
              }`}
              title="My Account"
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium hidden md:inline">Account</span>
            </button>

            {/* Shopping Cart Icon & Drawer Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-[#0B4FD8] hover:bg-[#002B7F] text-white rounded-full transition-colors cursor-pointer shadow-xs"
              title="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden md:inline">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Visible only on small screens) */}
        <div className="mt-2.5 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search phones, TVs, solar, appliances..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-xs bg-slate-100 rounded-full border border-slate-300 focus:outline-none focus:border-[#0B4FD8] text-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 text-[11px] font-semibold text-white bg-[#0B4FD8] rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Quick Category Bar */}
      <nav className="hidden lg:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-medium text-slate-700">
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-[#0B4FD8] cursor-pointer whitespace-nowrap ${
                page === 'home' ? 'text-[#0B4FD8] font-bold' : ''
              }`}
            >
              All Departments
            </button>
            {CATEGORIES.slice(0, 8).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => openCategory(cat.slug)}
                className="hover:text-[#0B4FD8] cursor-pointer whitespace-nowrap text-slate-600 hover:font-semibold transition-all"
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('policy', { policyType: 'privacy' })}
              className="text-slate-500 hover:text-slate-800"
            >
              Buyer Protection
            </button>
            <span className="text-slate-300">·</span>
            <a
              href="https://shop.cleomarkets.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B4FD8] font-bold hover:underline flex items-center gap-1"
            >
              Pay Small Small Portal ↗
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};
