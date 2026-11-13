import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Lock,
  Search,
  DollarSign,
  ArrowUpRight,
  Filter,
  Download,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { formatNaira } from '../services/store';
import { CATEGORIES } from '../data/categories';
import { CategorySlug, Order, Product } from '../types';
import { uploadToCloudinary, uploadRemoteImageToCloudinary } from '../services/cloudinary';

export const AdminView: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { currentUser, authLoading } = useShop();
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  const isAdmin = !!adminEmail && currentUser?.email?.trim().toLowerCase() === adminEmail;
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    bnplApplications,
    updateBNPLStatus,
    customer,
  } = useShop();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'bnpl' | 'payments'>('analytics');

  // Add Product Form State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('LG');
  const [formCategory, setFormCategory] = useState<CategorySlug>('smartphones');
  const [formPrice, setFormPrice] = useState('150000');
  const [formOriginalPrice, setFormOriginalPrice] = useState('180000');
  const [formStock, setFormStock] = useState('10');
  const [formPssDaily, setFormPssDaily] = useState('1000');
  const [formExistingImages, setFormExistingImages] = useState<string[]>([]);
  const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
  const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = formImageFiles.map((file) => URL.createObjectURL(file));
    setFormImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [formImageFiles]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [importingCatalogue, setImportingCatalogue] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [importSummary, setImportSummary] = useState('');
  const [formDescription, setFormDescription] = useState('High-performance electronics with factory warranty.');

  const handleImportCatalogue = async () => {
    if (!isAdmin || importingCatalogue) return;
    setImportingCatalogue(true);
    setImportSummary('');
    setImportProgress('Reading the existing C-LEO catalogue…');
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    let firstFailure = '';
    try {
      const response = await fetch('/api/catalogue');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not read the existing catalogue.');
      const sourceProducts = Array.isArray(payload.products) ? payload.products : [];
      if (!sourceProducts.length) throw new Error('The old catalogue returned no products.');
      const existingLinks = new Set(products.map((p) => p.cleoShopUrl).filter(Boolean));
      let cursor = 0;
      const importOne = async () => {
        while (cursor < sourceProducts.length) {
          const index = cursor++;
          const source = sourceProducts[index];
          const permalink = String(source.permalink || '');
          const name = String(source.name || '').trim();
          const imageSource = String(source.images?.[0]?.src || '');
          if (!name || !permalink || !imageSource || existingLinks.has(permalink)) {
            skipped += 1;
            continue;
          }
          try {
            setImportProgress(`Importing ${index + 1} of ${sourceProducts.length}: ${name}`);
            const sourceImages = (source.images || []).slice(0, 5).map((item: any) => String(item.src || '')).filter(Boolean);
            const uploadedImages: string[] = [];
            for (const sourceImage of sourceImages) {
              try {
                const uploaded = await uploadRemoteImageToCloudinary(sourceImage);
                uploadedImages.push(uploaded.url);
              } catch (imageError) {
                console.warn('One catalogue image could not be copied:', imageError);
                if (!firstFailure) firstFailure = imageError instanceof Error ? imageError.message : 'A catalogue image could not be copied.';
              }
            }
            if (!uploadedImages.length) throw new Error(firstFailure || 'No product photos could be copied from the old catalogue.');
            const minorUnit = Number(source.prices?.currency_minor_unit ?? 2);
            const divisor = Math.pow(10, minorUnit);
            const price = Number(source.prices?.price || 0) / divisor;
            const regularPrice = Number(source.prices?.regular_price || source.prices?.price || 0) / divisor;
            if (!price || !Number.isFinite(price)) { failed += 1; continue; }
            const nameText = name.toLowerCase();
            const categoryName =
              /phone|mobile|smartphone|tecno|infinix|itel|samsung|iphone/.test(nameText) ? 'Phones & Accessories' :
              /laptop|computer|hp elitebook|dell xps/.test(nameText) ? 'Laptops & Computers' :
              /tv|television/.test(nameText) ? 'Televisions' :
              /kitchen|cook|blender|iron|stove|air fryer|dispenser|freezer|fridge|washing machine|fan/.test(nameText) ? 'Home & Kitchen Appliances' :
              /solar|power|energy|inverter|battery|generator/.test(nameText) ? 'Power & Solar' :
              /audio|speaker|sound|headphone|earphone|earbud|jbl/.test(nameText) ? 'Audio & Accessories' :
              /furniture|chair|table|dining/.test(nameText) ? 'Furniture' :
              /camera|security/.test(nameText) ? 'Cameras & Security' :
              /watch|accessor|glass/.test(nameText) ? 'Accessories' : 'Other Products';
            const categoryText = categoryName.toLowerCase();
            const category: CategorySlug =
              /phone/.test(categoryText) ? 'smartphones' :
              /laptop|computer/.test(categoryText) ? 'laptops-computers' :
              /television/.test(categoryText) ? 'televisions' :
              /kitchen|appliance/.test(categoryText) ? 'home-appliances' :
              /solar|power/.test(categoryText) ? 'power-solar' :
              /audio/.test(categoryText) ? 'audio-speakers' :
              /furniture/.test(categoryText) ? 'furniture' :
              /camera/.test(categoryText) ? 'cameras-security' :
              /accessor/.test(categoryText) ? 'watches-accessories' : 'other-products';
            const description = String(source.short_description || source.description || '')
              .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\\s+/g, ' ').trim();
            const dailyMatch = description.match(/₦\\s*([\\d,]+)\\s*(?:per\\s*)?day/i);
            const dailyRate = dailyMatch ? Number(dailyMatch[1].replace(/,/g, '')) : 0;
            const monthsMatch = description.match(/(\\d+)\\s*months?/i);
            await addProduct({
              name,
              brand: name.split(/\\s+/)[0] || 'C-LEO',
              category,
              categoryName,
              price,
              originalPrice: regularPrice > price ? regularPrice : price,
              discountPercent: regularPrice > price ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0,
              rating: 5,
              reviewCount: 0,
              image: uploadedImages[0],
              additionalImages: uploadedImages.slice(1),
              inStock: source.is_in_stock !== false,
              stockCount: source.is_in_stock === false ? 0 : 10,
              isFeatured: false,
              paySmallSmallDaily: dailyRate,
              paySmallSmallDurationDays: monthsMatch ? Number(monthsMatch[1]) * 30 : 0,
              cleoShopUrl: permalink,
              description,
              specifications: {},
              warranty: 'As stated by C-LEO Market',
              deliveryEstimate: 'As stated by C-LEO Market',
            });
            existingLinks.add(permalink);
            imported += 1;
          } catch (itemError) {
            console.error('Catalogue item import failed:', name, itemError);
            if (!firstFailure) firstFailure = itemError instanceof Error ? itemError.message : 'Product import failed.';
            failed += 1;
          }
        }
      };
      await Promise.all(Array.from({ length: 4 }, () => importOne()));
      setImportSummary(`Import finished: ${imported} added, ${skipped} already present or incomplete, ${failed} failed. ${firstFailure ? 'First issue: ' + firstFailure : 'Product photos copied to Cloudinary and products saved to Firebase.'}`);
    } catch (error) {
      setImportSummary(error instanceof Error ? error.message : 'Catalogue import failed.');
    } finally {
      setImportingCatalogue(false);
      setImportProgress('');
    }
  };

  // Analytics Computations
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const pendingBnplCount = bnplApplications.filter((b) => b.status === 'pending_review').length;

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setProductFormError('');
    try {
    const uploadedImages: string[] = [];
    for (const file of formImageFiles) {
      uploadedImages.push((await uploadToCloudinary(file, 'products')).url);
    }
    const finalImages = [...formExistingImages, ...uploadedImages].slice(0, 5);
    if (!finalImages.length) throw new Error('Please upload at least one product photo.');
    const imageUrl = finalImages[0];
    const catObj = CATEGORIES.find((c) => c.slug === formCategory);

    const priceNum = Number(formPrice) || 0;
    const origPriceNum = Number(formOriginalPrice) || priceNum;
    const discount = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: formName,
        brand: formBrand,
        category: formCategory,
        categoryName: catObj?.name || 'Electronics',
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercent: discount,
        stockCount: Number(formStock) || 1,
        paySmallSmallDaily: Number(formPssDaily) || 1000,
        image: imageUrl,
        additionalImages: finalImages.slice(1),
        description: formDescription,
      });
    } else {
      await addProduct({
        name: formName,
        brand: formBrand,
        category: formCategory,
        categoryName: catObj?.name || 'Electronics',
        price: priceNum,
        originalPrice: origPriceNum,
        discountPercent: discount,
        rating: 5.0,
        reviewCount: 1,
        image: imageUrl,
        additionalImages: finalImages.slice(1),
        inStock: true,
        stockCount: Number(formStock) || 10,
        isFeatured: true,
        paySmallSmallDaily: Number(formPssDaily) || 1000,
        paySmallSmallWeekly: (Number(formPssDaily) || 1000) * 7,
        cleoShopUrl: `https://shop.cleomarkets.com/?product=${encodeURIComponent(formName)}&action=pay-small-small`,
        description: formDescription,
        specifications: {
          Model: formName,
          Manufacturer: formBrand,
          Warranty: '12 Months Official Warranty',
        },
        warranty: '1 Year Warranty',
        deliveryEstimate: '1-3 business days nationwide',
      });
    }

    setIsAddProductModalOpen(false);
    setEditingProductId(null);
    resetForm();
    } catch (error) {
      setProductFormError(error instanceof Error ? error.message : 'Could not save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormOriginalPrice((prod.originalPrice || prod.price).toString());
    setFormStock(prod.stockCount.toString());
    setFormPssDaily(prod.paySmallSmallDaily.toString());
    setFormExistingImages([prod.image, ...(prod.additionalImages || [])].filter(Boolean).slice(0, 5));
    setFormImageFiles([]);
    setFormDescription(prod.description);
    setIsAddProductModalOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormBrand('LG');
    setFormCategory('smartphones');
    setFormPrice('150000');
    setFormOriginalPrice('180000');
    setFormStock('10');
    setFormPssDaily('1000');
    setFormDescription('');
    setFormExistingImages([]);
    setFormImageFiles([]);
    setProductFormError('');
  };

  if (authLoading) return <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-slate-500">Checking administrator access…</div>;
  if (!isAdmin) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><ShieldAlert className="mx-auto mb-3 h-10 w-10 text-rose-500" /><h1 className="text-xl font-extrabold text-slate-900">Administrator access only</h1><p className="mt-2 text-sm text-slate-600">Sign in with the authorized C-LEO Market administrator email to access this area.</p><button onClick={() => navigateTo('account')} className="mt-5 rounded-xl bg-[#0B4FD8] px-5 py-3 text-sm font-bold text-white">Go to Account / Sign In</button></div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12">
      {/* Top Admin Header */}
      <div className="bg-[#002B7F] text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            PSS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">C-LEO Admin Management</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Orders, Bank Transfer Reviews, Inventory & BNPL Risk Approvals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            Go to Storefront
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Delivery ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bnpl')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'bnpl'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>BNPL Applications ({bnplApplications.length})</span>
          {pendingBnplCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingBnplCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'border-[#0B4FD8] text-[#0B4FD8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Bank Transfer Records</span>
        </button>
      </div>

      {/* Tab 1: Analytics & KPI Tiles */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Total Verified Revenue</span>
              <p className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                {formatNaira(totalSales)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +18.4% this month
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Total Store Orders</span>
              <p className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                {orders.length} Orders
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {pendingOrdersCount} pending dispatch
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">BNPL Financing Requests</span>
              <p className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                {bnplApplications.length} Applied
              </p>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                {pendingBnplCount} awaiting underwriting
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Active Products in Stock</span>
              <p className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                {products.length} Items
              </p>
              <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                Across 13 departments
              </span>
            </div>
          </div>

          {/* Recent Orders Overview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Recent Store Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                View All Orders →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-blue-700">{o.orderNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">{o.customer.fullName}</td>
                      <td className="p-3 text-slate-600">{o.customer.city}, {o.customer.state}</td>
                      <td className="p-3 text-slate-600">{o.items.length} items</td>
                      <td className="p-3 font-bold text-slate-950 tabular-nums">{formatNaira(o.total)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 capitalize font-semibold">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Product Catalog Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Active Inventory & Pay Small Small Rates
              </h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleImportCatalogue} disabled={importingCatalogue} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 disabled:opacity-60">
                  <Download className="h-4 w-4" /> {importingCatalogue ? 'Importing catalogue…' : 'Import Existing Catalogue'}
                </button>
                <button
              onClick={() => {
                resetForm();
                setEditingProductId(null);
                setIsAddProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B4FD8] hover:bg-[#002B7F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
                <span>Add New Product</span>
                </button>
              </div>
            </div>
            {(importProgress || importSummary) && <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">{importProgress || importSummary}</div>}
            {importSummary && <p className="text-xs text-slate-600">{importSummary}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (₦)</th>
                    <th className="p-3">PSS Rate (Daily)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80">
                      <td className="p-3 flex items-center gap-2.5 min-w-[240px]">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-[10px] text-blue-700 font-bold">{prod.brand}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{prod.categoryName}</td>
                      <td className="p-3 font-bold text-slate-900 tabular-nums">
                        {formatNaira(prod.price)}
                      </td>
                      <td className="p-3 text-amber-900 font-semibold tabular-nums">
                        {formatNaira(prod.paySmallSmallDaily)}/day
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            prod.stockCount > 5 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {prod.stockCount} units
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => updateProduct(prod.id, { isFeatured: !prod.isFeatured })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            prod.isFeatured ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {prod.isFeatured ? 'Featured' : 'Standard'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => startEditProduct(prod)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Order Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Order Fulfillment & Delivery Dispatches
          </h3>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-sm">{ord.orderNumber}</span>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">
                      Customer: {ord.customer.fullName} ({ord.customer.phone})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Address: {ord.customer.address}, {ord.customer.city}, {ord.customer.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Change Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-3">
                  <div className="space-y-1">
                    <div>Items: <strong>{ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}</strong></div>
                    <div className="text-slate-600">Payment: <strong className="capitalize">{ord.paymentMethod}</strong> · <strong className="capitalize">{ord.paymentStatus}</strong></div>
                    {ord.receiptFileName && <div className="text-slate-600">Receipt: {ord.receiptPath ? <a href={ord.receiptPath} target="_blank" rel="noreferrer" className="text-blue-700 underline">{ord.receiptFileName}</a> : ord.receiptFileName}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-black text-slate-950 text-sm tabular-nums">Total: {formatNaira(ord.total)}</div>
                    {ord.paymentStatus === 'pending' && <button onClick={() => updatePaymentStatus(ord.id, 'verified')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">Approve payment</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: BNPL Management */}
      {activeTab === 'bnpl' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Buy Now Pay Later Credit Applications & Risk Underwriting
          </h3>

          <div className="space-y-3">
            {bnplApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-xs">{app.applicationNumber}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{app.customer.fullName} - {app.product.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Phone: {app.customer.phone} · BVN/NIN: {app.customer.bvnOrNin} · Income: {formatNaira(app.customer.monthlyIncome)}/mo
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateBNPLStatus(app.id, 'approved', 'Approved by Risk Manager. Deposit payment link issued.')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateBNPLStatus(app.id, 'rejected', 'Credit criteria score below threshold.')}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Product Price</span>
                    <span className="font-bold text-slate-900">{formatNaira(app.product.price)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Initial Deposit</span>
                    <span className="font-bold text-blue-700">{formatNaira(app.depositAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Duration</span>
                    <span className="font-bold text-slate-900">{app.durationMonths} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Installment</span>
                    <span className="font-bold text-slate-900">{formatNaira(app.monthlyPayment)} / mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Bank Transfer Records */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Bank Transfer Payment Records
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 text-blue-700 font-bold">{o.paymentReference}</td>
                      <td className="p-3 text-slate-500 font-sans">{new Date(o.date).toLocaleDateString()}</td>
                      <td className="p-3 text-slate-800 font-sans">{o.customer.fullName}</td>
                      <td className="p-3 text-slate-950 font-bold tabular-nums">{formatNaira(o.total)}</td>
                      <td className="p-3 font-sans capitalize">{o.paymentMethod}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                          {o.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#0B4FD8] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">
                {editingProductId ? 'Edit Catalog Product' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. TECNO Camon 50 Pro 5G"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. LG, TECNO, Hisense"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4FD8]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original Price (₦)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PSS Daily (₦)</label>
                  <input
                    type="number"
                    value={formPssDaily}
                    onChange={(e) => setFormPssDaily(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Photos * (up to 5)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const remaining = Math.max(0, 5 - formExistingImages.length - formImageFiles.length);
                    if (selected.length > remaining) setProductFormError('You can add up to five photos in total.');
                    else setProductFormError('');
                    setFormImageFiles((prev) => [...prev, ...selected.slice(0, remaining)]);
                    e.currentTarget.value = '';
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                <p className="mt-1 text-xs text-slate-500">Choose up to five JPG, PNG or WEBP photos. Tap × on any preview to remove it before saving. Each photo must be 8MB or smaller.</p>
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {formExistingImages.map((url, index) => (
                    <div key={url + index} className="relative">
                      <img src={url} alt={`Product photo ${index + 1}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="h-20 w-full rounded-lg object-cover border border-slate-200 bg-slate-100" />
                      <button type="button" onClick={() => setFormExistingImages((prev) => prev.filter((_, i) => i !== index))} className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-rose-600 text-white font-bold shadow" aria-label="Remove photo">×</button>
                    </div>
                  ))}
                  {formImagePreviews.map((url, index) => (
                    <div key={url} className="relative">
                      <img src={url} alt={`New product photo ${index + 1}`} className="h-20 w-full rounded-lg object-cover border border-slate-200 bg-slate-100" />
                      <button type="button" onClick={() => setFormImageFiles((prev) => prev.filter((_, i) => i !== index))} className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-rose-600 text-white font-bold shadow" aria-label="Remove photo">×</button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">{formExistingImages.length + formImageFiles.length} of 5 photos selected</p>
                {productFormError && <p className="mt-2 text-xs text-rose-600">{productFormError}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 bg-[#0B4FD8] hover:bg-[#002B7F] text-white font-bold rounded-lg cursor-pointer disabled:opacity-60"
                >
                  {savingProduct ? 'Uploading & Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
