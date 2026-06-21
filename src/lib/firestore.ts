
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
    items: { productId: string; quantity: number; name: string; price: number }[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'completed';
    createdAt: number; // Using number for ms timestamp
    formId: string;
}


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
  const ref = collection(db, 'users', uid, 'forms');
  const docRef = await addDoc(ref, {
    ...form,
    createdAt: Timestamp.now(),
  });
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
  const ref = doc(db, 'users', uid, 'forms', formId);
  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
};

// ✅ Delete form
export const deleteOrderForm = async (
  uid: string,
  formId: string
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'forms', formId);
  await deleteDoc(ref);
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
    const ordersRef = collection(db, 'users', uid, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toMillis(),
        } as Order;
    });
};

// ✅ Get analytics data for a user
export const getAnalyticsData = async (uid: string) => {
  const orders = await getOrders(uid);

  if (orders.length === 0) {
    return null;
  }

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;

  const productCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders,
    topProducts,
  };
};


// ✅ Export db for external usage (needed by pages like `page.tsx`)
export { db };
