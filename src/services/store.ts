import { INITIAL_PRODUCTS } from '../data/initialProducts';
import {
  BNPLApplication,
  CartItem,
  CustomerDetails,
  NotificationItem,
  Order,
  Product,
} from '../types';

export const formatNaira = (amount: number): string => {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
};

const STORAGE_KEYS = {
  PRODUCTS: 'pss_products_v1',
  CART: 'pss_cart_v1',
  WISHLIST: 'pss_wishlist_v1',
  ORDERS: 'pss_orders_v1',
  BNPL: 'pss_bnpl_v1',
  CUSTOMER: 'pss_customer_v1',
  NOTIFICATIONS: 'pss_notifications_v1',
};

// Seed initial orders so admin and customer dashboards have realistic data immediately
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'PSS-ORD-89421',
    date: '2026-11-10T14:22:00.000Z',
    customer: {
      fullName: 'Oluwaseun Adeleke',
      email: 'seun.adeleke@gmail.com',
      phone: '+234 803 456 7890',
      address: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lekki',
      state: 'Lagos',
      notes: 'Call before delivery',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[1], // Air Fryer
        quantity: 1,
      },
    ],
    subtotal: 68000,
    deliveryFee: 3500,
    discountAmount: 0,
    total: 71500,
    status: 'delivered',
    paymentMethod: 'transfer',
    paymentReference: 'Legacy transfer reference',
    paymentStatus: 'verified',
    trackingNumber: 'GIG-EXP-489201',
  },
  {
    id: 'ord-1002',
    orderNumber: 'PSS-ORD-89580',
    date: '2026-11-11T09:15:00.000Z',
    customer: {
      fullName: 'Dr. Chinedu Eze',
      email: 'chinedu.eze@unilag.edu.ng',
      phone: '+234 812 345 6789',
      address: 'Plot 402 Constitution Avenue',
      city: 'Central Business District',
      state: 'Abuja (FCT)',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0], // TECNO Camon 50 Pro
        quantity: 1,
      },
    ],
    subtotal: 345000,
    deliveryFee: 4500,
    discountAmount: 0,
    total: 349500,
    status: 'processing',
    paymentMethod: 'transfer',
    paymentReference: 'Legacy transfer reference',
    paymentStatus: 'verified',
    trackingNumber: 'RED-STAR-902184',
  },
];

const SEED_BNPL: BNPLApplication[] = [
  {
    id: 'bnpl-2001',
    applicationNumber: 'PSS-BNPL-4029',
    date: '2026-11-11T16:40:00.000Z',
    customer: {
      fullName: 'Fatima Ibrahim',
      email: 'fatima.ibrahim@zenithbank.com',
      phone: '+234 802 888 9911',
      address: '8 Ahmadu Bello Way',
      city: 'Kaduna',
      state: 'Kaduna',
      bvnOrNin: '22345678901',
      employmentStatus: 'employed',
      monthlyIncome: 450000,
      employerName: 'Zenith Bank PLC',
      nextOfKinName: 'Musa Ibrahim',
      nextOfKinPhone: '+234 803 777 1234',
    },
    product: {
      id: INITIAL_PRODUCTS[4].id,
      name: INITIAL_PRODUCTS[4].name,
      image: INITIAL_PRODUCTS[4].image,
      price: INITIAL_PRODUCTS[4].price,
    },
    depositAmount: 180000,
    durationMonths: 6,
    monthlyPayment: 78500,
    totalFinanced: 415000,
    status: 'pending_review',
    adminNotes: 'Employment verified via corporate email. Bank statement pending.',
  },
];

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_PRODUCTS;

    // Refresh legacy local image paths saved before Vite asset imports were corrected.
    const currentImages = new Map(INITIAL_PRODUCTS.map((product) => [product.id, product.image]));
    return parsed.map((product: Product) => ({
      ...product,
      image: typeof product.image === 'string' && product.image.startsWith('/src/assets/images/')
        ? (currentImages.get(product.id) || product.image.replace('/src/assets/images/', '/assets/images/'))
        : product.image,
    }));
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
};

export const getStoredWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredWishlist = (wishlist: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

export const getStoredBNPL = (): BNPLApplication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BNPL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BNPL, JSON.stringify(SEED_BNPL));
      return SEED_BNPL;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_BNPL;
  }
};

export const saveStoredBNPL = (apps: BNPLApplication[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BNPL, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save BNPL:', e);
  }
};

export const getStoredCustomer = (): CustomerDetails => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    return raw
      ? JSON.parse(raw)
      : {
          fullName: 'Oluwaseun Adeleke',
          email: 'seun.adeleke@gmail.com',
          phone: '+234 803 456 7890',
          address: '14 Admiralty Way, Lekki Phase 1',
          city: 'Lekki',
          state: 'Lagos',
        };
  } catch {
    return {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'Lagos',
    };
  }
};

export const saveStoredCustomer = (customer: CustomerDetails) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
  } catch (e) {
    console.error('Failed to save customer:', e);
  }
};

export const getStoredNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const defaultNotifs: NotificationItem[] = [
        {
          id: 'notif-1',
          title: 'Welcome to C-LEO Market Service (PSS)',
          message: 'Explore quality electronics, Pay Small Small plans starting at ₦1,000/day, and fast nationwide delivery.',
          date: 'Just now',
          read: false,
          type: 'promo',
        },
        {
          id: 'notif-2',
          title: 'Order Shipped: PSS-ORD-89421',
          message: 'Your SilverCrest 4L Air Fryer is out for delivery with GIG Logistics.',
          date: 'Yesterday',
          read: true,
          type: 'order',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (notifs: NotificationItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};
