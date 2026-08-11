
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
} from 'firebase/firestore';
import { db, storage } from './firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import { getCurrencySymbol } from './currencies';

// Product Type Definition
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string; // URL of the product image
}

// Order Type Definition
export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    items: { productId?: string; quantity: number; name: string; price: number }[];
    total: number;
    currency?: string;
    currencySymbol?: string;
    fulfillmentType?: 'delivery' | 'pickup';
    address?: string;
    status?: 'pending' | 'confirmed' | 'shipped' | 'completed';
    createdAt: number; // Using number for ms timestamp
    formId?: string;
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

// ✅ Create a new order for a user
export const createOrder = async (uid: string, orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    const ordersRef = collection(db, 'users', uid, 'orders');
    const docRef = await addDoc(ordersRef, {
        ...orderData,
        createdAt: Timestamp.now(),
        status: 'pending', // Default status
    });
    return docRef.id;
};

// ✅ Get all orders for a user
export const getOrders = async (uid: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'users', uid, 'orders');
    const snap = await getDocs(ordersRef);
    const ordersList = snap.docs.map(doc => {
      const data = doc.data();
      let createdAtMs = Date.now();
      if (data.createdAt) {
        if (typeof data.createdAt.toMillis === 'function') {
          createdAtMs = data.createdAt.toMillis();
        } else if (typeof data.createdAt === 'number') {
          createdAtMs = data.createdAt;
        } else if (data.createdAt.seconds) {
          createdAtMs = data.createdAt.seconds * 1000;
        }
      }
      return {
        id: doc.id,
        customerName: data.customerName || 'Customer',
        customerPhone: data.customerPhone || '',
        items: data.items || [],
        total: Number(data.total) || 0,
        currency: data.currency || '',
        currencySymbol: data.currencySymbol || '',
        status: data.status || 'pending',
        createdAt: createdAtMs,
        formId: data.formId || '',
      } as Order;
    });

    return ordersList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
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
