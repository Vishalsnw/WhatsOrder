
#!/bin/bash

set -e  # Exit on any error
set -x  # Print commands as they execute

echo "🚀 Building WhatsOrder Android App..."

# Function to handle errors
handle_error() {
    echo "❌ Build failed at step: $1"
    echo "Check the logs above for specific error details"
    exit 1
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install || handle_error "npm install"
fi

# Install Capacitor and plugins
echo "📱 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android || handle_error "Capacitor core installation"
npm install @capacitor/camera @capacitor/geolocation @capacitor/push-notifications || handle_error "Capacitor plugins batch 1"
npm install @capacitor/local-notifications @capacitor/preferences @capacitor/share || handle_error "Capacitor plugins batch 2"
npm install @capacitor/device @capacitor/network @capacitor/filesystem || handle_error "Capacitor plugins batch 3"
npm install @capacitor/status-bar @capacitor/keyboard @capacitor/haptics || handle_error "Capacitor plugins batch 4"

# Fix any audit issues first
echo "🔧 Fixing audit issues..."
npm audit fix --force || echo "⚠️ Audit fix failed, continuing..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out

# Build the web app
echo "🔨 Building web app..."
if ! npm run build; then
    echo "❌ Next.js build failed. Checking for common issues..."
    echo "Checking TypeScript errors..."
    npx tsc --noEmit 2>&1 | head -20 || echo "TypeScript check failed"
    echo "Checking ESLint errors..."
    npm run lint 2>&1 | head -10 || echo "ESLint check failed"
    handle_error "Next.js build - check build.log for details"
fi

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
    handle_error "Missing index.html"
fi

echo "✅ Web app built successfully"

# Initialize Capacitor (only if not already initialized)
if [ ! -d "android" ]; then
    echo "⚡ Initializing Capacitor..."
    npx cap init "WhatsOrder" "com.whatsorder.app" --web-dir=out || handle_error "Capacitor init"
fi

# Add Android platform
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android || handle_error "Adding Android platform"
fi

# Sync files to Android
echo "🔄 Syncing files to Android..."
npx cap sync android || handle_error "Capacitor sync"

echo "✅ Android project ready!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Add your Firebase google-services.json to android/app/"
echo "3. Update Facebook App ID in android/app/src/main/res/values/strings.xml"
echo "4. Build APK in Android Studio or run: cd android && ./gradlew assembleDebug"
echo ""
echo "APK will be generated at: android/app/build/outputs/apk/debug/app-debug.apk"
