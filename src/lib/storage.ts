import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns its public download URL.
 * @param file - The File object to upload
 * @param path - Optional subfolder path (e.g. "product-images/")
 * @returns string - The public download URL
 */
export const uploadImage = async (file: File, path: string = 'uploads/'): Promise<string> => {
  try {
    const fileId = uuidv4();
    const storageRef = ref(storage, `${path}${fileId}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

// ✅ Alias for compatibility with components using this name
export const uploadImageAndGetURL = uploadImage;
