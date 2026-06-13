package com.myreleaseapp

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*

class AudioRouteModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val TAG = "AudioRouteModule"
    }

    private val audioManager: AudioManager =
        reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    override fun getName(): String = "AudioRoute"

    /**
     * Route audio to the earpiece (low volume, near-ear — like a standard phone call).
     * Works for ALL audio streams including WebView media audio.
     */
    @ReactMethod
    fun routeToEarpiece(promise: Promise) {
        try {
            audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ — use the new setCommunicationDevice API which
                // directly selects the hardware earpiece and works for ALL audio streams.
                val earpiece = audioManager.availableCommunicationDevices
                    .firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE }

                if (earpiece != null) {
                    val success = audioManager.setCommunicationDevice(earpiece)
                    Log.d(TAG, "routeToEarpiece (Android 12+): setCommunicationDevice success=$success")
                    promise.resolve(success)
                } else {
                    // No earpiece found (tablet?), fall back
                    audioManager.isSpeakerphoneOn = false
                    Log.d(TAG, "routeToEarpiece: no builtin earpiece found, setSpeakerphoneOn(false)")
                    promise.resolve(false)
                }
            } else {
                // Android < 12 — classic approach
                audioManager.isSpeakerphoneOn = false
                Log.d(TAG, "routeToEarpiece (legacy): setSpeakerphoneOn(false)")
                promise.resolve(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "routeToEarpiece error: ${e.message}")
            promise.reject("AUDIO_ROUTE_ERROR", e.message)
        }
    }

    /**
     * Route audio to the loudspeaker (full volume, hands-free).
     */
    @ReactMethod
    fun routeToSpeaker(promise: Promise) {
        try {
            audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ — use the new API
                val speaker = audioManager.availableCommunicationDevices
                    .firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }

                if (speaker != null) {
                    val success = audioManager.setCommunicationDevice(speaker)
                    Log.d(TAG, "routeToSpeaker (Android 12+): setCommunicationDevice success=$success")
                    promise.resolve(success)
                } else {
                    audioManager.isSpeakerphoneOn = true
                    promise.resolve(false)
                }
            } else {
                audioManager.isSpeakerphoneOn = true
                Log.d(TAG, "routeToSpeaker (legacy): setSpeakerphoneOn(true)")
                promise.resolve(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "routeToSpeaker error: ${e.message}")
            promise.reject("AUDIO_ROUTE_ERROR", e.message)
        }
    }

    /**
     * Reset audio to system default (normal mode, speaker off).
     * Call this when the call ends.
     */
    @ReactMethod
    fun resetAudio(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                audioManager.clearCommunicationDevice()
            }
            audioManager.isSpeakerphoneOn = false
            audioManager.mode = AudioManager.MODE_NORMAL
            Log.d(TAG, "resetAudio: mode reset to NORMAL")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "resetAudio error: ${e.message}")
            promise.reject("AUDIO_ROUTE_ERROR", e.message)
        }
    }
}
