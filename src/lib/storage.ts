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
        const scaleFactor = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available.');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject('Failed to compress image.');
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject('Image failed to load.');
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject('File reading failed.');
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
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid or missing file for upload.');
  }

  try {
    const fileId = uuidv4();
    const compressedBlob = await compressImage(file);
    const safeFileName = file.name.replace(/\s+/g, '_');
    const filePath = `${path}${fileId}-${safeFileName}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, compressedBlob);
    const downloadURL = await getDownloadURL(fileRef);

    return downloadURL;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

// ✅ Alias for compatibility with other imports
export const uploadImageAndGetURL = uploadImage;
