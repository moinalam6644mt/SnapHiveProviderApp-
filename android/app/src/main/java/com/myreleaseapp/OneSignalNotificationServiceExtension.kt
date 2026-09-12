package com.myreleaseapp

import android.content.Intent
import android.util.Log
import com.onesignal.notifications.INotificationServiceExtension
import com.onesignal.notifications.INotificationReceivedEvent
import org.json.JSONObject

class OneSignalNotificationServiceExtension : INotificationServiceExtension {
    override fun onNotificationReceived(event: INotificationReceivedEvent) {
        val notification = event.notification
        val data = notification.additionalData

        if (data != null && (data.optString("type") == "call" || data.optString("screen") == "call")) {
            Log.d("OneSignalExt", "Received Call Notification! Waking up Headless JS")
            
            // Prevent the default OneSignal banner from showing
            event.preventDefault()

            val context = event.context
            
            // Extract or generate UUID
            var roomId = data.optString("roomId")
            if (roomId.isNullOrEmpty()) {
                roomId = java.util.UUID.randomUUID().toString()
            }
            val callerName = data.optString("member_name", "Customer")

            // Start Headless Task
            val intent = Intent(context, CallKeepHeadlessService::class.java)
            intent.putExtra("roomId", roomId)
            intent.putExtra("callerName", callerName)
            
            // In Android 8+, background services must be started in foreground if app is killed, 
            // but HeadlessJsTaskService handles it or we can use startService
            try {
                context.startService(intent)
            } catch (e: Exception) {
                Log.e("OneSignalExt", "Failed to start Headless Service", e)
            }
        }
    }
}
