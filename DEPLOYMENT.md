
# Android Deployment Guide

## GitHub Actions Workflows

Two workflows are available for building your Android app:

### 1. Automatic Build (`build-android.yml`)
- **Triggers:** Push to `main`/`develop`, Pull Requests, Manual dispatch
- **Outputs:** Debug APK, Release APK (unsigned)
- **Signed Build:** Only on `main` branch with keystore secrets

### 2. Manual Build (`build-manual.yml`)
- **Triggers:** Manual dispatch only
- **Options:** Debug, Release, or Signed builds
- **Environments:** Development or Production

## Setting Up Secrets (for Signed Builds)

Add these secrets to your GitHub repository:

1. **KEYSTORE_BASE64**: Base64 encoded keystore file
2. **KEYSTORE_PASSWORD**: Keystore password
3. **KEY_ALIAS**: Key alias name
4. **KEY_PASSWORD**: Key password

### Generate Keystore:
```bash
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias your-app
```

### Convert to Base64:
```bash
base64 -i release.keystore -o keystore.base64.txt
```

## Build Outputs

### Debug Build
- **File:** `app-debug.apk`
- **Use:** Testing and development
- **Signing:** Debug keystore (auto-generated)

### Release Build
- **File:** `app-release-unsigned.apk`
- **Use:** Testing production builds
- **Signing:** None (unsigned)

### Signed Build
- **File:** `app-release.apk`
- **Use:** Production deployment
- **Signing:** Your release keystore

### Play Store Build (AAB)
- **File:** `app-release.aab`
- **Use:** Google Play Store upload
- **Signing:** Your release keystore

## Firebase Setup

1. Download `google-services.json` from Firebase Console
2. Add it to your repository at `android/app/google-services.json`
3. Commit and push to trigger build

## Facebook Login Setup

1. Get your Facebook App ID and Client Token
2. Update these files:
   - `android/app/src/main/res/values/strings.xml`
   - `capacitor.config.ts`

## Using Your Web URL

To build with your deployed web app instead of local files:

1. Update `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-web-app-url.com',
  cleartext: true
}
```

2. Push changes to trigger build

## Manual Build Process

1. Go to **Actions** tab in GitHub
2. Select **Manual Android Build**
3. Click **Run workflow**
4. Choose build type and environment
5. Download APK from artifacts

## Play Store Deployment

1. Use signed APK or AAB file
2. Upload to Google Play Console
3. Complete store listing with:
   - App description
   - Screenshots
   - Privacy policy
   - Content rating

## Local Testing

To test locally before deployment:
```bash
./build-android.sh
npx cap open android
```

Build in Android Studio or:
```bash
cd android && ./gradlew assembleDebug
```
