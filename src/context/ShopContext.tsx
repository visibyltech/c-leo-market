import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseAuth, firestoreDb } from '../lib/firebase';
import {
  BNPLApplication,
  CartItem,
  CustomerDetails,
  NotificationItem,
  Order,
  Product,
} from '../types';
import {
  getStoredBNPL,
  getStoredCart,
  getStoredCustomer,
  getStoredNotifications,
  getStoredProducts,
  getStoredWishlist,
  saveStoredBNPL,
  saveStoredCart,
  saveStoredCustomer,
  saveStoredNotifications,
  saveStoredProducts,
  saveStoredWishlist,
} from '../services/store';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
  currentUser: User | null;
  authLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;

  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'trackingNumber'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;

  bnplApplications: BNPLApplication[];
  submitBNPLApplication: (appData: Omit<BNPLApplication, 'id' | 'applicationNumber' | 'date' | 'status'>) => BNPLApplication;
  updateBNPLStatus: (id: string, status: BNPLApplication['status'], adminNotes?: string) => void;

  customer: CustomerDetails;
  updateCustomer: (details: Partial<CustomerDetails>) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  // Active Modals & Flow State
  activeBNPLProduct: Product | null;
  setActiveBNPLProduct: (product: Product | null) => void;
  activePSSProduct: Product | null;
  setActivePSSProduct: (product: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [wishlist, setWishlist] = useState<string[]>(getStoredWishlist);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bnplApplications, setBnplApplications] = useState<BNPLApplication[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails>({ fullName: '', email: '', phone: '', address: '', city: '', state: '' });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [activeBNPLProduct, setActiveBNPLProduct] = useState<Product | null>(null);
  const [activePSSProduct, setActivePSSProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => onAuthStateChanged(firebaseAuth, async (user) => {
    setCurrentUser(user);
    setAuthLoading(false);
    if (user) {
      try {
        const profile = await getDoc(doc(firestoreDb, 'customers', user.uid));
        if (profile.exists()) setCustomer((prev) => ({ ...prev, ...profile.data() } as CustomerDetails));
      } catch (error) { console.error('Could not load customer profile', error); }
    } else {
      setOrders([]);
    }
  }), []);

  useEffect(() => onSnapshot(collection(firestoreDb, 'products'), (snapshot) => {
    setProducts(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Product)));
  }, (error) => console.error('Catalogue sync failed', error)), []);

  useEffect(() => {
    if (!currentUser) { setOrders([]); return; }
    const admin = currentUser.email?.trim().toLowerCase() === 'tvplugng@gmail.com';
    const ordersQuery = admin ? collection(firestoreDb, 'orders') : query(collection(firestoreDb, 'orders'), where('userId', '==', currentUser.uid));
    return onSnapshot(ordersQuery, (snapshot) => {
      const cloudOrders = snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Order));
      setOrders(cloudOrders.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => console.error('Could not sync orders', error));
  }, [currentUser]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    await updateProfile(credential.user, { displayName: fullName.trim() });
    await sendEmailVerification(credential.user);
    const profile = { fullName: fullName.trim(), email: email.trim(), phone: '', address: '', city: '', state: '' };
    await setDoc(doc(firestoreDb, 'customers', credential.user.uid), { ...profile, uid: credential.user.uid, createdAt: new Date().toISOString() });
    setCustomer(profile);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  };

  const signOutUser = async () => { await signOut(firebaseAuth); };

  // Sync state to localStorage
  useEffect(() => saveStoredCart(cart), [cart]);
  useEffect(() => saveStoredWishlist(wishlist), [wishlist]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const addProduct = async (newProd: Omit<Product, 'id'>): Promise<Product> => {
    if (currentUser?.email?.trim().toLowerCase() !== 'tvplugng@gmail.com') throw new Error('Administrator access required. Please sign in with the authorised admin email.');
    // Refresh the Firebase ID token before a privileged write so Firestore
    // evaluates the latest authenticated email and verification claims.
    await currentUser.getIdToken(true);
    const id = doc(collection(firestoreDb, 'products')).id;
    const product: Product = { ...newProd, id };
    try {
      await setDoc(doc(firestoreDb, 'products', id), product);
    } catch (error: any) {
      if (error?.code === 'permission-denied' || /insufficient permissions/i.test(error?.message || '')) {
        throw new Error('Firebase is still rejecting admin product writes. The live Firestore Rules for project c-leo-market must include admin access for tvplugng@gmail.com on /products/{productId}.');
      }
      throw error;
    }
    showToast('Product added to the live catalogue.');
    return product;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (currentUser?.email?.trim().toLowerCase() !== 'tvplugng@gmail.com') throw new Error('Administrator access required.');
    await updateDoc(doc(firestoreDb, 'products', id), updates);
    showToast('Product updated successfully');
  };

  const deleteProduct = async (id: string) => {
    if (currentUser?.email?.trim().toLowerCase() !== 'tvplugng@gmail.com') throw new Error('Administrator access required.');
    await deleteDoc(doc(firestoreDb, 'products', id));
    showToast('Product removed from catalogue', 'info');
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added to cart: ${product.name.slice(0, 26)}...`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from saved items', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'trackingNumber'>): Promise<Order> => {
    if (!currentUser) throw new Error('Please sign in before placing an order.');
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `PSS-ORD-${randomDigits}`;
    const trackingNumber = `PSS-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      trackingNumber,
    };

    await setDoc(doc(firestoreDb, 'orders', newOrder.id), { ...newOrder, userId: currentUser.uid });
    setOrders((prev) => [newOrder, ...prev]);

    // Add customer notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Order Confirmed: ${orderNumber}`,
      message: `Your order has been received. Payment is pending admin verification. Order tracking: ${trackingNumber}`,
      date: 'Just now',
      read: false,
      type: 'order',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (currentUser?.email?.trim().toLowerCase() !== 'tvplugng@gmail.com') throw new Error('Administrator access required.');
    await updateDoc(doc(firestoreDb, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
    showToast('Order status updated to ' + status);
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    if (currentUser?.email?.trim().toLowerCase() !== 'tvplugng@gmail.com') throw new Error('Administrator access required.');
    await updateDoc(doc(firestoreDb, 'orders', orderId), { paymentStatus, updatedAt: new Date().toISOString() });
  };

  const submitBNPLApplication = (
    appData: Omit<BNPLApplication, 'id' | 'applicationNumber' | 'date' | 'status'>
  ): BNPLApplication => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const applicationNumber = `PSS-BNPL-${randomNum}`;
    const newApp: BNPLApplication = {
      ...appData,
      id: `bnpl-${Date.now()}`,
      applicationNumber,
      date: new Date().toISOString(),
      status: 'pending_review',
    };

    setBnplApplications((prev) => [newApp, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Financing Application Received: ${applicationNumber}`,
      message: `Your Buy Now Pay Later request for ${appData.product.name.slice(0, 30)} is being reviewed by our risk team.`,
      date: 'Just now',
      read: false,
      type: 'bnpl',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Buy Now Pay Later application submitted successfully!');
    return newApp;
  };

  const updateBNPLStatus = (id: string, status: BNPLApplication['status'], adminNotes?: string) => {
    setBnplApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status, adminNotes: adminNotes ?? app.adminNotes } : app))
    );
    showToast(`Financing application marked as ${status.replace('_', ' ')}`);
  };

  const updateCustomer = (details: Partial<CustomerDetails>) => {
    const safeDetails = { ...details };
    delete safeDetails.email;
    const updated = { ...customer, ...safeDetails, email: currentUser?.email || customer.email };
    setCustomer(updated);
    if (currentUser) {
      setDoc(doc(firestoreDb, 'customers', currentUser.uid), {
        fullName: updated.fullName,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        email: currentUser.email || '',
        uid: currentUser.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true }).then(() => showToast('Profile information saved.'))
        .catch((error) => { console.error('Profile save failed', error); showToast('Profile could not be saved. Please try again.', 'error'); });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <ShopContext.Provider
      value={{
        currentUser, authLoading, signUp, signIn, signOutUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        bnplApplications,
        submitBNPLApplication,
        updateBNPLStatus,
        customer,
        updateCustomer,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        activeBNPLProduct,
        setActiveBNPLProduct,
        activePSSProduct,
        setActivePSSProduct,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toasts,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return ctx;
};
