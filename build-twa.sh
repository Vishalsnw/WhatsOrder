
#!/bin/bash

echo "🚀 Building WhatsOrder TWA..."

# Generate keystore if it doesn't exist
if [ ! -f "release-key.jks" ]; then
    echo "🔐 Generating keystore..."
    keytool -genkeypair -alias key0 -keyalg RSA -keysize 2048 -validity 10000 \
        -keystore release-key.jks -storepass keypass123 -keypass keypass123 \
        -dname "CN=WhatsOrder,O=WhatsOrder,C=US"
fi

# Set environment variables for non-interactive mode
export BUBBLEWRAP_NO_INTERACTIVE=true

# Create the TWA project
echo "📱 Creating TWA project..."
bubblewrap init --manifest=./twa-manifest.json \
    --packageId=com.whatsorder.app \
    --signingKeyPath=./release-key.jks \
    --signingKeyAlias=key0 \
    --signingKeyPassword=keypass123 \
    --storePassword=keypass123 \
    --skipPwaValidation \
    --skipSdkInstall

echo "🔨 Building TWA..."
bubblewrap build

echo "✅ TWA build completed!"
echo "📱 APK: app-release-signed.apk"
echo "📦 AAB: app-release.aab"
