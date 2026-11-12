import React from 'react';
import { Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { formatNaira } from '../services/store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProduct } = useNavigation();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();

  const wishlisted = isWishlisted(product.id);

  const handleCardClick = () => {
    openProduct(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-200 overflow-hidden cursor-pointer h-full"
    >
      {/* Top Media Area with Badges & Wishlist Button */}
      <div className="relative aspect-4/3 sm:aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] sm:text-xs font-bold rounded-md shadow-xs">
            -{product.discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
              wishlisted ? 'fill-rose-600 text-rose-600' : ''
            }`}
          />
        </button>

        {/* Quick View Hover Cue (Desktop) */}
        <div className="hidden md:flex absolute inset-x-0 bottom-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5 justify-between">
        <div>
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-blue-700 tracking-wider uppercase text-[10px]">
              {product.brand}
            </span>
            <span className="text-[10px] font-medium text-emerald-700">
              {product.inStock ? 'In Stock' : 'Pre-order'}
            </span>
          </div>

          {/* Product Name (Constrained to 2 lines for uniform grid) */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.4rem] mb-1.5 group-hover:text-[#0B4FD8] transition-colors">
            {product.name}
          </h3>

          {/* Price Container */}
          <div className="flex items-baseline gap-1.5 flex-wrap mb-1.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-950 tabular-nums">
              {formatNaira(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Pay Small Small Promotional Indicator */}
          {product.paySmallSmallDaily > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-[10px] font-medium text-amber-900 mb-2">
              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
              <span>
                PSS from <strong className="font-bold text-amber-950">{formatNaira(product.paySmallSmallDaily)}/day</strong>
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          className="mt-1 w-full py-2 px-3 bg-[#0B4FD8] hover:bg-[#002B7F] active:scale-98 text-white text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
