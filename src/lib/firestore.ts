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
} from 'firebase/firestore';
import { db } from './firebase';

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
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...profile, updatedAt: Timestamp.now() }, { merge: true });
};

// ✅ Get user profile
export const getUserProfile = async (uid: string): Promise<any | null> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
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
  return snap.exists() ? snap.data() : null;
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

// ✅ Export db for external usage (needed by pages like `page.tsx`)
export { db };
