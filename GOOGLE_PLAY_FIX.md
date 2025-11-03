# Google Play Policy Compliance Fix

## Issue
Google Play rejected the app because it was requesting `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions for persistent access to photos/videos. However, the app only needs one-time access to upload product images.

## What Was Fixed

### 1. **Removed Persistent Storage Permissions**
**File:** `android/app/src/main/AndroidManifest.xml`

**Removed:**
- `READ_EXTERNAL_STORAGE` (converts to `READ_MEDIA_IMAGES` on Android 13+)
- `WRITE_EXTERNAL_STORAGE` (converts to `READ_MEDIA_VIDEO` on Android 13+)
- `RECORD_AUDIO` (not needed for this app)
- `MODIFY_AUDIO_SETTINGS` (not needed)
- `ACCESS_BACKGROUND_LOCATION` (not needed - only foreground location is used)

**Kept:**
- `CAMERA` - For taking product photos
- `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` - For geolocation features
- `INTERNET` - For network access
- Push notification permissions - For order notifications

### 2. **Configured Camera Plugin to Use Photo Picker**
**File:** `capacitor.config.ts`

Added configuration to use Android's built-in photo picker:
```typescript
Camera: {
  androidPhotoPickerGallery: true
}
```

This ensures that when users select images from their gallery, the app uses the modern Android photo picker instead of requesting full media access.

## How It Works Now

### Before (❌ Rejected)
- App requested permanent access to all photos/videos on device
- Google flagged this as excessive for an app that only uploads product images occasionally

### After (✅ Compliant)
- When taking photos: Uses `CAMERA` permission (allowed)
- When selecting from gallery: Uses Android photo picker (no permission needed)
- No persistent access to media files
- Fully compliant with Google Play's Photo and Video Permissions policy

## Next Steps to Resubmit

1. **Rebuild the Android app:**
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Generate new APK/AAB:**
   - Open Android Studio
   - Build → Generate Signed Bundle/APK
   - Create a new version code (e.g., 2 instead of 1)
   - Sign with your keystore

3. **Upload to Google Play Console:**
   - Go to Publishing overview
   - Create new release (production or internal testing)
   - Upload the new AAB file
   - Submit for review

4. **In the review notes, mention:**
   > "Fixed READ_MEDIA_IMAGES/READ_MEDIA_VIDEO permission issue by removing persistent storage permissions and implementing Android photo picker for one-time image selection. Camera permission is only used for taking photos directly within the app."

## Testing Before Submission

Test these scenarios to ensure everything works:

1. ✅ **Add product with camera photo**
   - Open app → Create form → Add product
   - Click image upload → Choose "Camera"
   - Take photo → Should work with CAMERA permission

2. ✅ **Add product with gallery image**
   - Open app → Create form → Add product
   - Click image upload → Choose "Gallery"
   - Select image → Should use photo picker (no permission prompt)

3. ✅ **All other features**
   - Forms still save correctly
   - WhatsApp integration works
   - Location services work
   - Push notifications work

## Why This Complies

According to Google Play's Photo and Video Permissions policy:
- ✅ We removed persistent media access permissions
- ✅ We use the Android photo picker for one-time image selection
- ✅ We only request CAMERA permission for direct photo capture
- ✅ Our use case (uploading product images) is infrequent, not continuous

This approach is recommended by Google's own documentation for apps that need to upload images occasionally.

## Reference
- [Google Play Photo and Video Permissions Policy](https://support.google.com/googleplay/android-developer/answer/14115180)
- [Android Photo Picker Documentation](https://developer.android.com/training/data-storage/shared/photopicker)
