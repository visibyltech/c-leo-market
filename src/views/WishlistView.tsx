import React from 'react';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistView: React.FC = () => {
  const { navigateTo, goBack } = useNavigation();
  const { products, wishlist } = useShop();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
          <span>Saved Items & Wishlist ({savedProducts.length})</span>
        </h1>
      </div>

      {savedProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Your wishlist is empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save items you are interested in or want to finance later with Pay Small Small by tapping the heart icon on any product.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="mt-2 px-5 py-2.5 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Explore Electronics
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {savedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
