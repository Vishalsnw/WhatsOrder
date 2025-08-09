
package com.whatsorder.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(com.capacitorjs.plugins.camera.CameraPlugin.class);
        registerPlugin(com.capacitorjs.plugins.filesystem.FilesystemPlugin.class);
        registerPlugin(com.capacitorjs.plugins.geolocation.GeolocationPlugin.class);
        registerPlugin(com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin.class);
        registerPlugin(com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin.class);
        registerPlugin(com.capacitorjs.plugins.share.SharePlugin.class);
        registerPlugin(com.capacitorjs.plugins.preferences.PreferencesPlugin.class);
        registerPlugin(com.capacitorjs.plugins.device.DevicePlugin.class);
        registerPlugin(com.capacitorjs.plugins.network.NetworkPlugin.class);
        registerPlugin(com.capacitorjs.plugins.statusbar.StatusBarPlugin.class);
        registerPlugin(com.capacitorjs.plugins.keyboard.KeyboardPlugin.class);
        registerPlugin(com.capacitorjs.plugins.haptics.HapticsPlugin.class);
        
        super.onCreate(savedInstanceState);
        
        // Handle share intents
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShareIntent(intent);
    }

    private void handleShareIntent(Intent intent) {
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                handleSendText(intent);
            }
        }
    }

    private void handleSendText(Intent intent) {
        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText != null) {
            // Pass shared text to web app
            getBridge().getWebView().evaluateJavascript(
                "window.handleShareIntent && window.handleShareIntent('" + sharedText + "')", 
                null
            );
        }
    }
}
