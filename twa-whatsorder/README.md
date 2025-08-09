
# WhatsOrder - Trusted Web Activity (TWA) Android App

This Android Studio project converts your WhatsOrder Next.js web app into a native Android app using Trusted Web Activity (TWA) technology.

## 🚀 Quick Start

### Prerequisites
- Android Studio (latest version recommended)
- Java JDK 8 or higher
- Android SDK (API level 23+)
- Your web app deployed at: https://whats-order-osr3.vercel.app/

## 📱 Building and Running Locally

### 1. Open in Android Studio
```bash
# Clone or download this project
# Open Android Studio
# File → Open → Select the twa-whatsorder folder
# Wait for Gradle sync to complete
```

### 2. Run on Device/Emulator
```bash
# Connect Android device or start emulator
# Click "Run" button or press Shift+F10
# Select your device and click OK
```

### 3. Generate Debug APK
```bash
# In Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
# APK will be generated at: app/build/outputs/apk/debug/app-debug.apk
```

## 🔐 Digital Asset Links Setup

### 1. Get SHA256 Fingerprint

#### For Debug Keystore:
```bash
# Run this in the project root directory:
./gradlew printSHA256

# Or manually:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### For Release Keystore:
```bash
# Run with your keystore:
./gradlew printSHA256 -PkeystorePath=/path/to/your/keystore.jks -PkeystorePassword=your_password -PkeyAlias=your_alias -PkeyPassword=your_key_password

# Or manually:
keytool -list -v -keystore /path/to/your/keystore.jks -alias your_alias
```

### 2. Add assetlinks.json to Your Vercel Project

Create the file `public/.well-known/assetlinks.json` in your Next.js project:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.whatsorder.app",
    "sha256_cert_fingerprints": [
      "YOUR_ACTUAL_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

### 3. Deploy to Vercel
```bash
# In your Next.js project:
git add public/.well-known/assetlinks.json
git commit -m "Add Digital Asset Links for TWA"
git push

# Verify it's accessible at:
# https://whats-order-osr3.vercel.app/.well-known/assetlinks.json
```

## 🔑 Creating a Release Keystore

### 1. Generate Release Keystore
```bash
keytool -genkey -v -keystore whatsorder-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias whatsorder

# Follow prompts to enter:
# - Keystore password
# - Key password  
# - Your name and organization details
```

### 2. Configure Release Signing

Add to `app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/whatsorder-release.jks')
            storePassword 'your_keystore_password'
            keyAlias 'whatsorder'
            keyPassword 'your_key_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Generate Release APK/AAB
```bash
# For APK:
./gradlew assembleRelease

# For AAB (recommended for Play Store):
./gradlew bundleRelease

# Files will be in:
# app/build/outputs/apk/release/
# app/build/outputs/bundle/release/
```

## 📦 Google Play Store Upload

### 1. Prepare for Play Store
- Generate signed AAB (Android App Bundle) using release keystore
- Get SHA256 fingerprint from release keystore
- Update assetlinks.json with release SHA256
- Deploy updated assetlinks.json to Vercel

### 2. Play App Signing (Recommended)
```bash
# When uploading to Play Console:
# 1. Enable "Play App Signing" 
# 2. Upload your signed AAB
# 3. Play Console will show you the SHA256 for app signing certificate
# 4. Update assetlinks.json with Play's SHA256 fingerprint
# 5. Redeploy to Vercel
```

### 3. Play Store Metadata
- **App Name**: WhatsOrder
- **Package**: com.whatsorder.app  
- **Category**: Business
- **Description**: Simple WhatsApp order form for small businesses
- **Screenshots**: Take from running TWA app
- **Privacy Policy**: Required if collecting user data

## ✨ Features Supported

### ✅ Fully Supported in TWA:
- File uploads via `<input type="file">`
- Camera capture for images
- Firebase Authentication & OAuth redirects
- Service Workers & PWA behaviors
- Push notifications
- Local storage & IndexedDB
- Geolocation (with permissions)
- Share API

### ⚠️ Considerations:
- Requires Chrome/WebView 72+ on device
- Some device-specific features need Chrome Custom Tabs
- Always test on real devices before release

## 🛠️ Customization

### Change App Details
Edit `app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.yourcompany.yourapp"
    // ... other config
}
```

### Update URLs
Edit `app/src/main/AndroidManifest.xml`:
```xml
<meta-data android:name="android.support.customtabs.trusted.DEFAULT_URL"
           android:value="https://your-domain.com/" />

<data android:scheme="https"
      android:host="your-domain.com" />
```

### App Icons
Replace files in:
- `app/src/main/res/mipmap-*/ic_launcher.png`
- `app/src/main/res/mipmap-*/ic_launcher_round.png`

### Colors & Theme
Edit `app/src/main/res/values/colors.xml` and `themes.xml`

## 🐛 Troubleshooting

### Digital Asset Links Not Working:
1. Verify assetlinks.json is accessible at correct URL
2. Check SHA256 fingerprint matches exactly
3. Ensure no extra spaces/characters in JSON
4. Wait up to 20 minutes for Google to verify

### App Not Opening URLs:
1. Clear Chrome data on device
2. Uninstall/reinstall app  
3. Check intent filters in AndroidManifest.xml
4. Test with `adb shell am start -a android.intent.action.VIEW -d "https://whats-order-osr3.vercel.app/"`

### File Uploads Not Working:
1. Grant camera/storage permissions
2. Test on real device (not emulator)
3. Check Chrome/WebView version (need 72+)

## 📚 Resources

- [Trusted Web Activities Guide](https://developers.google.com/web/android/trusted-web-activity)
- [Digital Asset Links](https://developers.google.com/digital-asset-links/v1/getting-started)
- [Android Browser Helper](https://github.com/GoogleChrome/android-browser-helper)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)

## 🤝 Support

For TWA-specific issues:
1. Check Chrome/WebView compatibility
2. Verify Digital Asset Links setup
3. Test web app functionality in Chrome mobile first
4. Check Android logs: `adb logcat | grep -i twa`

---

**Built with ❤️ for WhatsOrder**
