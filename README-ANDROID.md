
# WhatsOrder Android App

## 🚀 Quick Start

1. **Run the build script:**
   ```bash
   ./build-android.sh
   ```

2. **Add Firebase Configuration:**
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/google-services.json`

3. **Configure Facebook Login:**
   - Get Facebook App ID from Facebook Developers
   - Update `android/app/src/main/res/values/strings.xml`:
     ```xml
     <string name="facebook_app_id">YOUR_ACTUAL_FACEBOOK_APP_ID</string>
     <string name="facebook_client_token">YOUR_ACTUAL_CLIENT_TOKEN</string>
     ```

4. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

5. **Build APK:**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or via command line: `cd android && ./gradlew assembleDebug`

## 📱 Features Included

- ✅ Native Camera & Gallery access
- ✅ Push notifications (FCM)
- ✅ Local notifications
- ✅ Geolocation services
- ✅ Offline storage
- ✅ Google Sign-In ready
- ✅ Facebook Login ready
- ✅ Share intent handling
- ✅ Deep linking support
- ✅ Background sync capabilities
- ✅ Runtime permissions handling
- ✅ Android 7+ compatibility
- ✅ Play Store ready

## 🔧 Customization

### Change App Details
Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.yourapp',
  appName: 'Your App Name',
  // ...
};
```

### Update Web URL
To use your deployed web app instead of local build:
1. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://your-web-app-url.com',
     cleartext: true
   }
   ```
2. Run `npx cap sync android`

### Icons & Splash Screen
- Replace icons in `android/app/src/main/res/mipmap-*/`
- Update splash screen in `android/app/src/main/res/drawable/splash.xml`

## 🏗️ Build Commands

- **Debug APK:** `cd android && ./gradlew assembleDebug`
- **Release APK:** `cd android && ./gradlew assembleRelease`
- **AAB for Play Store:** `cd android && ./gradlew bundleRelease`

## 📋 Play Store Checklist

- [ ] App signed with release keystore
- [ ] Target SDK 34+ (Android 14)
- [ ] All permissions justified in store listing
- [ ] 64-bit architecture support enabled
- [ ] Privacy policy URL provided
- [ ] App content rating completed
- [ ] Store listing with screenshots and description

## 🔐 Signing for Release

1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore my-app.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-app
   ```

2. Add to `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('path/to/my-app.keystore')
               storePassword 'your-keystore-password'
               keyAlias 'my-app'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               // ...
           }
       }
   }
   ```

## 🛠️ Native API Usage

The app includes a `useNativeFeatures` hook with these methods:

```typescript
const {
  takePicture,        // Camera/Gallery access
  getCurrentLocation, // GPS location
  scheduleNotification, // Local notifications
  storeData,         // Offline storage
  getData,           // Retrieve stored data
  shareContent,      // Native sharing
  isNative,          // Check if running as native app
  networkStatus      // Online/offline status
} = useNativeFeatures();
```

Example usage:
```typescript
// Take a photo
const imageUrl = await takePicture();

// Get location
const location = await getCurrentLocation();

// Store data offline
await storeData('user_preferences', JSON.stringify(preferences));

// Share content
await shareContent('Check this out!', 'Amazing app', 'https://yourapp.com');
```

The app automatically handles:
- Runtime permissions for camera, location, storage
- Network connectivity changes
- Android back button
- Share intents from other apps
- Deep link navigation
- Push notification setup

Your WhatsOrder app is now ready to be compiled as a native Android app with all modern features!
