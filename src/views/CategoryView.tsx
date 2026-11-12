import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  ArrowUpDown,
  Search,
  Check,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from '../components/ProductCard';
import { CategorySlug, Product } from '../types';
import { formatNaira } from '../services/store';

export const CategoryView: React.FC = () => {
  const { selectedCategory, searchQuery, openCategory } = useNavigation();
  const { products } = useShop();

  // Filter States
  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'all'>(
    selectedCategory || 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(1500000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchQuery || '');

  // Extract all unique brands
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand));
    return Array.from(brands).sort();
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category match
      if (activeCategory !== 'all' && prod.category !== activeCategory) {
        return false;
      }
      // Brand match
      if (selectedBrand !== 'all' && prod.brand !== selectedBrand) {
        return false;
      }
      // Price match
      if (prod.price > priceMax) {
        return false;
      }
      // In-stock match
      if (inStockOnly && !prod.inStock) {
        return false;
      }
      // Keyword search
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesBrand = prod.brand.toLowerCase().includes(q);
        const matchesCategory = prod.categoryName.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, activeCategory, selectedBrand, priceMax, inStockOnly, sortBy, keyword]);

  const currentCategoryInfo = CATEGORIES.find((c) => c.slug === activeCategory);

  const resetFilters = () => {
    setActiveCategory('all');
    setSelectedBrand('all');
    setPriceMax(1500000);
    setInStockOnly(false);
    setKeyword('');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      {/* Category / Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 mb-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">
              {keyword ? 'Search Results' : 'Catalog Directory'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {keyword ? `Search: "${keyword}"` : currentCategoryInfo ? currentCategoryInfo.name : 'All Products & Departments'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} verified products available for instant order, BNPL & Pay Small Small
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters</span>
              {(selectedBrand !== 'all' || inStockOnly || activeCategory !== 'all' || priceMax < 1500000) && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Categories Horizontal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#0B4FD8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B4FD8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Drawer / Panel when toggled */}
      {isFilterDrawerOpen && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Refine Product Results</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Cap Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
                <span>Max Price:</span>
                <span className="text-[#0B4FD8] font-mono tabular-nums">{formatNaira(priceMax)}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={1500000}
                step={25000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₦50k</span>
                <span>₦1.5M+</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>In-Stock Only (Exclude Pre-Orders)</span>
              </label>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">
                Only show devices available for instant dispatch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid: Strict 2-column on mobile as mandated! */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-bold text-slate-800">No products match your current filters</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, price range or selected brand to see more available items.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#0B4FD8] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
