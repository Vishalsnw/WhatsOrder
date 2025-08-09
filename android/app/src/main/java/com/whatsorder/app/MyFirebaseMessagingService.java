
package com.whatsorder.app;

import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.getcapacitor.JSObject;
import com.getcapacitor.plugin.util.AssetUtil;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            
            JSObject pushNotificationJSON = new JSObject();
            pushNotificationJSON.put("id", remoteMessage.getMessageId());
            pushNotificationJSON.put("title", remoteMessage.getNotification() != null ? remoteMessage.getNotification().getTitle() : "");
            pushNotificationJSON.put("body", remoteMessage.getNotification() != null ? remoteMessage.getNotification().getBody() : "");
            pushNotificationJSON.put("type", "foreground");
            
            JSObject data = new JSObject();
            for (String key : remoteMessage.getData().keySet()) {
                data.put(key, remoteMessage.getData().get(key));
            }
            pushNotificationJSON.put("data", data);
            
            PushNotificationsPlugin.sendRemoteMessage(pushNotificationJSON);
        }

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed token: " + token);
        PushNotificationsPlugin.onNewToken(token);
    }
}
