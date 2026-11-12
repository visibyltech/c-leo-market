import {
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
};

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

export const getStoredOrders = (): Order[] => [];

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

export const getStoredBNPL = (): BNPLApplication[] => [];

export const saveStoredBNPL = (apps: BNPLApplication[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BNPL, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save BNPL:', e);
  }
};

export const getStoredCustomer = (): CustomerDetails => ({ fullName: '', email: '', phone: '', address: '', city: '', state: '' });

export const saveStoredCustomer = (customer: CustomerDetails) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
  } catch (e) {
    console.error('Failed to save customer:', e);
  }
};

export const getStoredNotifications = (): NotificationItem[] => [];

export const saveStoredNotifications = (notifs: NotificationItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};
