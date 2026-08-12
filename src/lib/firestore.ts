
// src/lib/firestore.ts

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, storage } from './firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import { getCurrencySymbol } from './currencies';

// Product Type Definition
export interface Product {
  id?: string;
  name: string;
  price: number;
  image?: string; // URL of the product image
  description?: string;
  stock?: number; // Available inventory count
  isUnlimited?: boolean; // If true, stock tracking is skipped
  isOutOfStock?: boolean; // Manual or auto out-of-stock toggle
  available?: boolean; // Standard availability flag
}

// Delivery Zone & Config Type Definitions
export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

export interface DeliveryConfig {
  enabled: boolean;
  type: 'flat' | 'zones' | 'tiered';
  baseFee: number;
  enableFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  zones?: DeliveryZone[];
  enablePickup?: boolean;
  pickupAddress?: string;
}

// Order Type Definition
export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    items: { productId?: string; quantity: number; name: string; price: number }[];
    subtotal?: number;
    deliveryFee?: number;
    deliveryZone?: string;
    total: number;
    currency?: string;
    currencySymbol?: string;
    fulfillmentType?: 'delivery' | 'pickup';
    paymentMethod?: string;
    address?: string;
    status?: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
    createdAt: number; // Using number for ms timestamp
    formId?: string;
    slug?: string;
    sellerUid?: string;
}

// Form Type Definition
export interface Form {
    id: string;
    title?: string;
    businessName?: string;
    currency?: string;
    currencySymbol?: string;
    products?: Product[];
    deliveryConfig?: DeliveryConfig;
    views?: number;
    slug?: string;
    createdAt?: any;
}

// Function to generate a URL-friendly slug from a string
const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};


// ✅ Save or update user profile
export const saveUserProfile = async (
  uid: string,
  profile: {
    phone: string;
    name?: string;
    businessName?: string;
    createdAt?: Timestamp;
  }
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...profile, updatedAt: Timestamp.now() }, { merge: true });
};

// ✅ Get user profile
export const getUserProfile = async (uid: string): Promise<any | null> => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

// ✅ Add a new product to a user's product catalog
export const addProduct = async (
  uid: string,
  productData: { name: string; price: number; image?: File | null; }
): Promise<string> => {
  let imageUrl = '';
  if (productData.image) {
    const imageRef = ref(storage, `products/${uid}/${Date.now()}_${productData.image.name}`);
    const uploadResult = await uploadBytes(imageRef, productData.image);
    imageUrl = await getDownloadURL(uploadResult.ref);
  }

  const productsRef = collection(db, 'users', uid, 'products');
  const docRef = await addDoc(productsRef, {
    name: productData.name,
    price: productData.price,
    imageUrl: imageUrl,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

// ✅ Get all products for a user
export const getProducts = async (uid: string): Promise<Product[]> => {
  const productsRef = collection(db, 'users', uid, 'products');
  const snap = await getDocs(productsRef);
  return snap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    price: doc.data().price,
    image: doc.data().imageUrl,
  }));
};


// ✅ Save new form (auto ID)
export const createOrderForm = async (
  uid: string,
  form: {
    businessName: string;
    phone: string;
    products: { name: string; price: number; image?: string }[];
  }
): Promise<string> => {
  const slug = generateSlug(form.businessName);
  const formData = {
    ...form,
    slug,
    userId: uid,
    createdAt: Timestamp.now(),
  };

  const userFormCollectionRef = collection(db, 'users', uid, 'forms');
  const docRef = await addDoc(userFormCollectionRef, formData);

  const publicFormDocRef = doc(db, 'publicForms', docRef.id);
  await setDoc(publicFormDocRef, formData);

  return docRef.id;
};

// ✅ Get all forms for user
export const getUserForms = async (
  uid: string
): Promise<Array<{ id: string; [key: string]: any }>> => {
  const ref = collection(db, 'users', uid, 'forms');
  const snap = await getDocs(ref);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get single form by ID
export const getOrderFormById = async (
  uid: string,
  formId: string
): Promise<any | null> => {
  const ref = doc(db, 'users', uid, 'forms', formId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ✅ Update form
export const updateOrderForm = async (
  uid: string,
  formId: string,
  updates: {
    businessName?: string;
    phone?: string;
    products?: { name: string; price: number; image?: string }[];
  }
): Promise<void> => {
    const newUpdates: { [key: string]: any } = { ...updates, updatedAt: Timestamp.now() };

  if (updates.businessName) {
    newUpdates.slug = generateSlug(updates.businessName);
  }

  const userFormRef = doc(db, 'users', uid, 'forms', formId);
  await updateDoc(userFormRef, newUpdates);

  const publicFormRef = doc(db, 'publicForms', formId);
  await updateDoc(publicFormRef, newUpdates);
};

// ✅ Delete form
export const deleteOrderForm = async (
  uid: string,
  formId: string
): Promise<void> => {
  const userFormRef = doc(db, 'users', uid, 'forms', formId);
  await deleteDoc(userFormRef);

  const publicFormRef = doc(db, 'publicForms', formId);
  await deleteDoc(publicFormRef);
};

// ✅ Create a new order for a user / form
export const createOrder = async (
  uid: string,
  orderData: Omit<Order, 'id' | 'createdAt'> & { slug?: string; sellerUid?: string }
): Promise<string> => {
    let resolvedUid = uid || orderData.sellerUid || '';

    // If sellerUid is not passed, attempt lookup in publicForms by formId or slug
    if (!resolvedUid) {
      if (orderData.formId) {
        try {
          const publicSnap = await getDoc(doc(db, 'publicForms', orderData.formId));
          if (publicSnap.exists()) {
            const pData = publicSnap.data();
            resolvedUid = pData?.userId || pData?.uid || pData?.ownerId || '';
          }
        } catch (e) {
          console.warn('Could not resolve sellerUid from publicForms formId:', e);
        }
      }
      if (!resolvedUid && orderData.slug) {
        try {
          const publicFormsRef = collection(db, 'publicForms');
          const q = query(publicFormsRef, where('slug', '==', orderData.slug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const pData = snap.docs[0].data();
            resolvedUid = pData?.userId || pData?.uid || pData?.ownerId || '';
          }
        } catch (e) {
          console.warn('Could not resolve sellerUid from publicForms slug:', e);
        }
      }
    }

    const timestamp = Timestamp.now();
    const createdAtMs = Date.now();
    let createdDocId = '';

    const payload = {
      ...orderData,
      sellerUid: resolvedUid,
      createdAt: timestamp,
      createdAtMs: createdAtMs,
      status: orderData.status || 'pending',
    };

    // 1. Primary write to seller's orders subcollection if resolvedUid exists
    if (resolvedUid) {
      try {
        const ordersRef = collection(db, 'users', resolvedUid, 'orders');
        const docRef = await addDoc(ordersRef, payload);
        createdDocId = docRef.id;
      } catch (e) {
        console.warn('Could not write order to user subcollection:', e);
      }
    }

    // 2. Redundant write to top-level orders collection so no order is ever missed
    try {
      const topOrdersRef = collection(db, 'orders');
      const topDocRef = await addDoc(topOrdersRef, {
        ...payload,
        orderId: createdDocId || undefined,
      });
      if (!createdDocId) {
        createdDocId = topDocRef.id;
      }
    } catch (e) {
      console.warn('Could not write order to top-level orders collection:', e);
    }

    // 3. Increment order counter and deduct inventory safely
    if (resolvedUid && orderData.formId) {
      try {
        const userFormRef = doc(db, 'users', resolvedUid, 'forms', orderData.formId);
        const formSnap = await getDoc(userFormRef);
        if (formSnap.exists()) {
          const currentOrders = Number(formSnap.data()?.orders || 0);
          await updateDoc(userFormRef, { orders: currentOrders + 1 });
        }
      } catch (e) {
        console.warn('Could not update order count on user form:', e);
      }

      try {
        const publicFormRef = doc(db, 'publicForms', orderData.formId);
        const publicFormSnap = await getDoc(publicFormRef);
        if (publicFormSnap.exists()) {
          const currentOrders = Number(publicFormSnap.data()?.orders || 0);
          await updateDoc(publicFormRef, { orders: currentOrders + 1 });
        }
      } catch (e) {
        console.warn('Could not update order count on public form:', e);
      }

      if (orderData.items && orderData.items.length > 0) {
        try {
          await deductFormInventory(orderData.formId, resolvedUid, orderData.items);
        } catch (e) {
          console.warn('Could not deduct inventory:', e);
        }
      }
    }

    return createdDocId || `ORD-${Date.now().toString().slice(-6)}`;
};

// ✅ Deduct inventory stock for ordered items in a form
export const deductFormInventory = async (
  formId: string,
  sellerUid: string,
  orderedItems: { name: string; quantity: number }[]
): Promise<void> => {
  if (!formId) return;
  try {
    const publicFormRef = doc(db, 'publicForms', formId);
    const publicFormSnap = await getDoc(publicFormRef);

    if (!publicFormSnap.exists()) return;

    const formData = publicFormSnap.data();
    if (!formData || !Array.isArray(formData.products)) return;

    let updated = false;
    const updatedProducts = formData.products.map((p: any) => {
      const match = orderedItems.find(item => item.name === p.name);
      if (match && match.quantity > 0) {
        // If stock tracking is active
        if (p.isUnlimited !== true && typeof p.stock === 'number') {
          const newStock = Math.max(0, Number(p.stock) - match.quantity);
          const isOutOfStock = newStock <= 0;
          updated = true;
          return {
            ...p,
            stock: newStock,
            isOutOfStock: isOutOfStock || p.isOutOfStock,
            available: !isOutOfStock,
          };
        }
      }
      return p;
    });

    if (updated) {
      try {
        await updateDoc(publicFormRef, { products: updatedProducts, updatedAt: Timestamp.now() });
      } catch (e) {
        console.warn('Could not update publicForm inventory:', e);
      }
      if (sellerUid) {
        try {
          const userFormRef = doc(db, 'users', sellerUid, 'forms', formId);
          await updateDoc(userFormRef, { products: updatedProducts, updatedAt: Timestamp.now() });
        } catch (e) {
          console.warn('Could not update userForm inventory:', e);
        }
      }
    }
  } catch (err) {
    console.error('Error deducting form inventory:', err);
  }
};

// Helper function to map firestore doc to Order object
const mapDocToOrder = (docId: string, data: any): Order => {
  let createdAtMs = Date.now();
  if (data.createdAt) {
    if (typeof data.createdAt.toMillis === 'function') {
      createdAtMs = data.createdAt.toMillis();
    } else if (typeof data.createdAt === 'number') {
      createdAtMs = data.createdAt;
    } else if (data.createdAtMs) {
      createdAtMs = Number(data.createdAtMs);
    } else if (data.createdAt.seconds) {
      createdAtMs = data.createdAt.seconds * 1000;
    }
  }
  return {
    id: docId,
    customerName: data.customerName || 'Customer',
    customerPhone: data.customerPhone || '',
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: typeof data.subtotal === 'number' ? data.subtotal : Number(data.total) || 0,
    deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee : 0,
    deliveryZone: data.deliveryZone || '',
    total: Number(data.total) || 0,
    currency: data.currency || '',
    currencySymbol: data.currencySymbol || '',
    fulfillmentType: data.fulfillmentType || 'delivery',
    paymentMethod: data.paymentMethod || 'standard',
    address: data.address || '',
    status: data.status || 'pending',
    createdAt: createdAtMs,
    formId: data.formId || '',
    slug: data.slug || '',
    sellerUid: data.sellerUid || '',
  };
};

// ✅ Get all orders for a user
export const getOrders = async (uid: string): Promise<Order[]> => {
  if (!uid) return [];
  try {
    const ordersMap = new Map<string, Order>();

    // 1. Primary query: seller's orders subcollection
    try {
      const ordersRef = collection(db, 'users', uid, 'orders');
      const snap = await getDocs(ordersRef);
      snap.docs.forEach(d => {
        ordersMap.set(d.id, mapDocToOrder(d.id, d.data()));
      });
    } catch (e) {
      console.error('Error fetching user orders subcollection:', e);
    }

    // 2. Secondary query: top-level orders where sellerUid == uid
    try {
      const publicOrdersRef = collection(db, 'orders');
      const q = query(publicOrdersRef, where('sellerUid', '==', uid));
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        const data = d.data();
        const orderId = data.orderId || d.id;
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, mapDocToOrder(orderId, data));
        }
      });
    } catch (e) {
      // Ignore fallback error
    }

    // 3. Fallback: match by formId or slug belonging to user's forms
    try {
      const forms = await getUserForms(uid);
      const formIds = forms.map(f => f.id).filter(Boolean);
      const slugs = forms.map(f => f.slug).filter(Boolean);

      if (formIds.length > 0 || slugs.length > 0) {
        const publicOrdersRef = collection(db, 'orders');
        const snap = await getDocs(publicOrdersRef);
        snap.docs.forEach(d => {
          const data = d.data();
          const orderId = data.orderId || d.id;
          if (!ordersMap.has(orderId)) {
            if ((data.formId && formIds.includes(data.formId)) || (data.slug && slugs.includes(data.slug))) {
              ordersMap.set(orderId, mapDocToOrder(orderId, data));
            }
          }
        });
      }
    } catch (e) {
      // Ignore fallback error
    }

    const ordersList = Array.from(ordersMap.values());
    return ordersList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

// ✅ Real-time subscriber for user's orders
export const subscribeToOrders = (
  uid: string,
  onOrdersUpdate: (orders: Order[]) => void
): (() => void) => {
  if (!uid) return () => {};

  const unsubscribes: (() => void)[] = [];

  const refreshAllOrders = async () => {
    const orders = await getOrders(uid);
    onOrdersUpdate(orders);
  };

  try {
    const userOrdersRef = collection(db, 'users', uid, 'orders');
    const unsub1 = onSnapshot(
      userOrdersRef,
      () => {
        refreshAllOrders();
      },
      (error) => {
        console.error('Error in user orders snapshot listener:', error);
      }
    );
    unsubscribes.push(unsub1);
  } catch (e) {
    console.error('Failed to setup user orders snapshot listener:', e);
  }

  try {
    const topOrdersRef = collection(db, 'orders');
    const q = query(topOrdersRef, where('sellerUid', '==', uid));
    const unsub2 = onSnapshot(
      q,
      () => {
        refreshAllOrders();
      },
      (error) => {
        console.error('Error in top orders snapshot listener:', error);
      }
    );
    unsubscribes.push(unsub2);
  } catch (e) {
    console.error('Failed to setup top orders snapshot listener:', e);
  }

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

import { isTodayInTimezone, isThisMonthInTimezone, getUserBrowserTimezone } from './timezones';

// ✅ Get analytics data for a user with timezone accuracy
export const getAnalyticsData = async (uid: string) => {
  try {
    const [orders, forms, userProfile] = await Promise.all([
      getOrders(uid),
      getUserForms(uid),
      getUserProfile(uid),
    ]);

    const sellerTimezone = userProfile?.timezone || getUserBrowserTimezone();

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let thisMonthRevenue = 0;
    let thisMonthOrders = 0;

    const totalOrders = orders.length;
    const totalForms = forms.length;
    let totalViews = 0;

    forms.forEach(f => {
      if (f.views && typeof f.views === 'number') {
        totalViews += f.views;
      }
    });

    const productCounts: { [key: string]: { name: string; count: number; revenue: number } } = {};

    orders.forEach(order => {
      const orderTotal = Number(order.total) || 0;
      totalRevenue += orderTotal;

      // Check timezone-accurate dates
      const isToday = isTodayInTimezone(order.createdAt, sellerTimezone);
      const isThisMonth = isThisMonthInTimezone(order.createdAt, sellerTimezone);

      if (isToday) {
        todayRevenue += orderTotal;
        todayOrders += 1;
      }

      if (isThisMonth) {
        thisMonthRevenue += orderTotal;
        thisMonthOrders += 1;
      }

      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || 'Product';
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          if (!productCounts[name]) {
            productCounts[name] = { name, count: 0, revenue: 0 };
          }
          productCounts[name].count += qty;
          productCounts[name].revenue += qty * price;
        });
      }
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const primaryCurrencySymbol = forms[0]?.currencySymbol || forms[0]?.currency ? getCurrencySymbol(forms[0]?.currency) : '$';

    return {
      totalRevenue,
      todayRevenue,
      todayOrders,
      thisMonthRevenue,
      thisMonthOrders,
      totalOrders,
      totalForms,
      totalViews,
      avgOrderValue,
      topProducts,
      recentOrders: orders.slice(0, 5),
      currencySymbol: primaryCurrencySymbol,
      sellerTimezone,
    };
  } catch (error) {
    console.error('Error calculating analytics:', error);
    return {
      totalRevenue: 0,
      todayRevenue: 0,
      todayOrders: 0,
      thisMonthRevenue: 0,
      thisMonthOrders: 0,
      totalOrders: 0,
      totalForms: 0,
      totalViews: 0,
      avgOrderValue: 0,
      topProducts: [],
      recentOrders: [],
      currencySymbol: '$',
      sellerTimezone: getUserBrowserTimezone(),
    };
  }
};


// ✅ Export db for external usage (needed by pages like `page.tsx`)
export { db };
