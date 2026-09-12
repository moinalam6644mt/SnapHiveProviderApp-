package com.myreleaseapp

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.bridge.Arguments

class CallKeepHeadlessService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        return extras?.let {
            HeadlessJsTaskConfig(
                "RNCallKeepBackgroundMessage",
                Arguments.fromBundle(it),
                60000,
                true
            )
        }
    }
}
