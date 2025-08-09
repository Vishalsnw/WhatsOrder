
#!/bin/bash

# WhatsOrder TWA - SHA256 Fingerprint Extractor
# This script extracts SHA256 fingerprint from Android keystores

echo "🔐 WhatsOrder TWA - SHA256 Fingerprint Extractor"
echo "================================================"

# Default values
KEYSTORE_PATH="$HOME/.android/debug.keystore"
KEYSTORE_PASSWORD="android"
KEY_ALIAS="androiddebugkey"
KEY_PASSWORD="android"

# Check if custom keystore provided
if [ "$1" != "" ]; then
    KEYSTORE_PATH="$1"
    echo "Using custom keystore: $KEYSTORE_PATH"
    
    read -p "Enter keystore password: " -s KEYSTORE_PASSWORD
    echo
    read -p "Enter key alias: " KEY_ALIAS
    read -p "Enter key password: " -s KEY_PASSWORD
    echo
else
    echo "Using debug keystore: $KEYSTORE_PATH"
fi

# Check if keystore exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Error: Keystore not found at $KEYSTORE_PATH"
    echo "💡 Usage: $0 [path/to/keystore.jks]"
    exit 1
fi

echo "🔍 Extracting SHA256 fingerprint..."

# Extract fingerprint
FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep "SHA256:" | sed 's/.*SHA256: //' | tr -d ' :')

if [ "$FINGERPRINT" != "" ]; then
    echo "✅ Success!"
    echo ""
    echo "========================================="
    echo "SHA256 Fingerprint: $FINGERPRINT"
    echo "========================================="
    echo ""
    echo "📋 Copy this fingerprint to your assetlinks.json:"
    echo ""
    echo "[{"
    echo "  \"relation\": [\"delegate_permission/common.handle_all_urls\"],"
    echo "  \"target\": {"
    echo "    \"namespace\": \"android_app\","
    echo "    \"package_name\": \"com.whatsorder.app\","
    echo "    \"sha256_cert_fingerprints\": ["
    echo "      \"$FINGERPRINT\""
    echo "    ]"
    echo "  }"
    echo "}]"
    echo ""
    echo "🌐 Upload this to: https://whats-order-osr3.vercel.app/.well-known/assetlinks.json"
else
    echo "❌ Error: Could not extract SHA256 fingerprint"
    echo "💡 Please check keystore path and credentials"
    exit 1
fi
