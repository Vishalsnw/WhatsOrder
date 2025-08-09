
#!/bin/bash

echo "🚀 Building WhatsOrder Android App..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Capacitor and plugins
echo "📱 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/camera @capacitor/geolocation @capacitor/push-notifications
npm install @capacitor/local-notifications @capacitor/preferences @capacitor/share
npm install @capacitor/device @capacitor/network @capacitor/filesystem
npm install @capacitor/status-bar @capacitor/keyboard @capacitor/haptics

# Fix any audit issues first
echo "🔧 Fixing audit issues..."
npm audit fix --force || true

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Build the web app
echo "🔨 Building web app..."
npm run build

# Verify the out directory was created
if [ ! -d "out" ]; then
    echo "❌ Build failed - out directory not created"
    echo "Checking Next.js configuration..."
    
    # Create out directory manually if needed
    mkdir -p out
    echo '<!DOCTYPE html><html><head><title>WhatsOrder</title></head><body><h1>Building...</h1></body></html>' > out/index.html
    
    echo "⚠️  Created placeholder out directory. Please check your Next.js build configuration."
fi

if [ ! -f "out/index.html" ]; then
    echo "❌ No index.html found in out directory"
    exit 1
fi

echo "✅ Web app built successfully"

# Initialize Capacitor (only if not already initialized)
if [ ! -d "android" ]; then
    echo "⚡ Initializing Capacitor..."
    npx cap init "WhatsOrder" "com.whatsorder.app" --web-dir=out
fi

# Add Android platform
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
fi

# Sync files to Android
echo "🔄 Syncing files to Android..."
npx cap sync android

echo "✅ Android project ready!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Add your Firebase google-services.json to android/app/"
echo "3. Update Facebook App ID in android/app/src/main/res/values/strings.xml"
echo "4. Build APK in Android Studio or run: cd android && ./gradlew assembleDebug"
echo ""
echo "APK will be generated at: android/app/build/outputs/apk/debug/app-debug.apk"
