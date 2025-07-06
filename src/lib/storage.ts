import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './firebase';

/**
 * Compress image using canvas before uploading to Firebase Storage.
 * @param file - The original image File
 * @param maxWidth - Maximum width in pixels
 * @param quality - JPEG quality (0 to 1)
 */
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas not supported.');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject('Compression failed.');
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file to Firebase Storage and returns its public download URL.
 * Compresses the image before upload for better performance.
 * @param file - The File object to upload
 * @param path - Optional subfolder path (e.g. "product-images/")
 * @returns string - The public download URL
 */
export const uploadImage = async (file: File, path: string = 'uploads/'): Promise<string> => {
  try {
    const fileId = uuidv4();
    const compressedBlob = await compressImage(file);
    const filename = `${path}${fileId}-${file.name.replace(/\s+/g, '_')}`;
    const fileRef = ref(storage, filename);

    await uploadBytes(fileRef, compressedBlob);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

// ✅ Alias for compatibility with components using this name
export const uploadImageAndGetURL = uploadImage;
