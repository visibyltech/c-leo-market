export type CategorySlug =
  | 'smartphones'
  | 'laptops-computers'
  | 'televisions'
  | 'home-appliances'
  | 'kitchen-appliances'
  | 'electronics-gadgets'
  | 'power-solar'
  | 'audio-speakers'
  | 'furniture'
  | 'cameras-security'
  | 'gaming-accessories'
  | 'watches-accessories'
  | 'other-products';

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  paySmallSmallDaily: number; // e.g. 1000 for ₦1,000/day
  paySmallSmallWeekly?: number;
  paySmallSmallDurationDays?: number;
  cleoShopUrl: string;
  description: string;
  specifications: Record<string, string>;
  warranty: string;
  deliveryEstimate: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'bnpl' | 'transfer';
  paymentReference: string;
  paymentStatus: 'verified' | 'pending' | 'failed';
  trackingNumber: string;
  receiptFileName?: string;
}

export interface BNPLApplication {
  id: string;
  applicationNumber: string;
  date: string;
  customer: CustomerDetails & {
    bvnOrNin: string;
    employmentStatus: 'employed' | 'self_employed' | 'business_owner';
    monthlyIncome: number;
    employerName: string;
    nextOfKinName: string;
    nextOfKinPhone: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  depositAmount: number;
  durationMonths: number;
  monthlyPayment: number;
  totalFinanced: number;
  status: 'pending_review' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'order' | 'payment' | 'bnpl' | 'promo';
  linkTo?: { page: PageView; id?: string };
}

export type PageView =
  | 'home'
  | 'category'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'account'
  | 'admin'
  | 'search'
  | 'about'
  | 'contact'
  | 'faq'
  | 'policy';
