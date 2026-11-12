import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Zap,
  Sparkles,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  Plus,
  Minus,
  Share2,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { formatNaira } from '../services/store';
import { ProductCard } from '../components/ProductCard';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import { BNPLModal } from '../components/modals/BNPLModal';
import { PaySmallSmallModal } from '../components/modals/PaySmallSmallModal';
import { ProductReview } from '../types';

export const ProductDetailsView: React.FC = () => {
  const { selectedProductId, goBack } = useNavigation();
  const { products, addToCart, toggleWishlist, isWishlisted, showToast } = useShop();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBNPLOpen, setIsBNPLOpen] = useState(false);
  const [isPSSOpen, setIsPSSOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev-1',
      productId: product.id,
      userName: 'Emeka Nwosu',
      rating: 5,
      comment: 'Top quality product! Delivered in Lagos within 24 hours. The packaging was immaculate.',
      date: '3 days ago',
      verifiedPurchase: true,
    },
    {
      id: 'rev-2',
      productId: product.id,
      userName: 'Amina Bello',
      rating: 5,
      comment: 'Genuine brand new item with official warranty card. C-LEO Market Service is my go-to store now.',
      date: '1 week ago',
      verifiedPurchase: true,
    },
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const wishlisted = isWishlisted(product.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on C-LEO Market Service (PSS)`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userName: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: 'Just now',
      verifiedPurchase: true,
    };

    setReviews([newRev, ...reviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    showToast('Thank you! Your verified review was added.');
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-lg border transition-colors shadow-2xs cursor-pointer ${
              wishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
            title="Save to wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main PDP 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs flex items-center justify-center p-4">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-md shadow-xs">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Additional Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedImage(product.image)}
              className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white p-1 cursor-pointer transition-all ${
                selectedImage === product.image ? 'border-[#0B4FD8]' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <img src={product.image} alt="Thumbnail 1" className="w-full h-full object-cover rounded-lg" />
            </button>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#0B4FD8] uppercase tracking-wider">
                {product.brand} · {product.categoryName}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{product.inStock ? `In Stock (${product.stockCount} units)` : 'Pre-order'}</span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Warranty Strip */}
            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-900">{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} customer reviews)</span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">{product.warranty}</span>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                  {formatNaira(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatNaira(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Save {formatNaira((product.originalPrice || 0) - product.price)}
                  </span>
                )}
              </div>

              {/* Pay Small Small Kicker */}
              {product.paySmallSmallDaily > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    PSS Daily Installment:
                  </span>
                  <span className="font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 tabular-nums">
                    From {formatNaira(product.paySmallSmallDaily)} / day
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 py-1">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1 text-xs font-bold text-slate-900 tabular-nums min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400">Total: {formatNaira(product.price * quantity)}</span>
            </div>

            {/* Primary shopping actions: two side-by-side, Pay Small Small below */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="min-w-0 py-3 px-2 sm:px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0 text-[#0B4FD8]" />
                  <span>ADD TO CART</span>
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="min-w-0 py-3 px-2 sm:px-4 bg-[#0B4FD8] hover:bg-[#002B7F] active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>BUY AND PAY NOW</span>
                </button>
              </div>
              <button
                onClick={() => setIsPSSOpen(true)}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>PAY SMALL SMALL</span>
              </button>
              <button
                onClick={() => setIsBNPLOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>BUY NOW, PAY LATER</span>
              </button>
            </div>

            {/* Delivery & Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-slate-200">
              <div className="p-2 bg-slate-50 rounded-xl">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">Fast Delivery</p>
                <p className="text-[10px] text-slate-500">{product.deliveryEstimate}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">Warranty</p>
                <p className="text-[10px] text-slate-500">{product.warranty}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">7 Days Return</p>
                <p className="text-[10px] text-slate-500">If defective on arrival</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications Section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200">
        {/* Description & Overview */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Product Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Customer Reviews Section */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating} out of 5</span>
              </div>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    {rev.verifiedPurchase && (
                      <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleAddReview} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Leave a Verified Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
                />
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600">Rating:</span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Good</option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Share your experience with this product..."
                required
                rows={2}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Technical Specifications Table */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Technical Specifications
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="grid grid-cols-12 p-3 text-xs">
                <span className="col-span-5 font-semibold text-slate-500">{key}</span>
                <span className="col-span-7 font-medium text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Related {product.categoryName}
            </h2>
          </div>
          {/* 2-Column Mobile Grid! */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal for Direct "Buy and Pay Now" */}
      {isCheckoutOpen && (
        <CheckoutModal
          directProduct={product}
          directQuantity={quantity}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* BNPL Modal */}
      {isBNPLOpen && (
        <BNPLModal
          product={product}
          onClose={() => setIsBNPLOpen(false)}
        />
      )}

      {/* Pay Small Small Modal */}
      {isPSSOpen && (
        <PaySmallSmallModal
          product={product}
          onClose={() => setIsPSSOpen(false)}
        />
      )}
    </div>
  );
};
