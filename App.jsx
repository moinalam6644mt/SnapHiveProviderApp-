import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { theme } from './src/styles/globalStyles';
import { BookingProvider } from './src/context/BookingContext';
import { AuthProvider } from './src/context/AuthContext';
import PusherService from './src/services/PusherService';
import { OtpSharedProvider } from './src/context/OtpSharedContext';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CallProvider } from './src/context/CallContext';
import {
  navigationRef,
  navigate,
  flushPendingNavigation,
} from './src/services/NavigationService';

// ─── Initialize OneSignal ───────────────────────────────────────────────────
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize('bccab546-8d91-4499-8caf-f2a8f9d3b12e');

// ─── Custom Toast Config ────────────────────────────────────────────────────
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: theme.background }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e1b4b',
        fontFamily: 'Sora-Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'Montserrat-Regular',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e1b4b',
        fontFamily: 'Sora-Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'Montserrat-Regular',
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#71B280' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e1b4b',
        fontFamily: 'Sora-Bold',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'Montserrat-Regular',
      }}
    />
  )
};

// ─── Register the click listener at module scope ───────────────────────────────
// OneSignal v5 buffers killed-state click events and replays them as soon as a
// listener is registered.  We handle THREE cases here:
//
//  1. Foreground / Background  → navigate() immediately (navigator is ready)
//  2. Killed state, fast path  → navigate() queued via pendingNavigation, flushed in onReady
//  3. Killed state, slow path  → notification persisted to AsyncStorage so HomeNavigator
//                                can pick it up after splash + auth loading completes
//
// Case 3 is the most important: NotificationHandling lives inside HomeNavigator
// which only mounts ~1.5s+ after cold start (splash + auth). By writing to
// AsyncStorage we guarantee the data survives that delay.
OneSignal.Notifications.addEventListener('click', async event => {
  console.log('[OneSignal] Notification clicked:', event);
  const data = event?.notification?.additionalData;
  console.log('[OneSignal] additionalData:', data);

  if (data?.channel_id) {
    const screen = data?.screen;
    const channelId = data?.channel_id;

    let targetScreen = 'NotificationHandling';
    let payloadParams = { orderId: channelId };

    if (screen === 'booking_cancelled') {
      targetScreen = 'CancelledBookingScreen';
    } else if (screen === 'booking_rescheduled') {
      targetScreen = 'JobDetailsScreen';
    } else if (screen === 'chat') {
      targetScreen = 'ChatDetails';
      payloadParams = {
        channelId: channelId,
        member_name: data?.member_name || 'User',
        logo: data?.logo || '',
        category_subchild_name: data?.category_subchild_name || '',
      };
    }

    if (screen === 'booking_cancelled' || screen === 'booking_rescheduled') {
      try {
        const storedUser = await AsyncStorage.getItem('authData');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.member_id) {
            payloadParams.userId = parsed.member_id;
          }
        }
      } catch (e) {
        console.warn('[OneSignal] Failed to get userId:', e);
      }
    }

    const payload = JSON.stringify({
      screen: targetScreen,
      ...payloadParams,
    });

    // Persist so HomeNavigator can consume it after mounting
    try {
      await AsyncStorage.setItem('pending_notification', payload);
      console.log('[OneSignal] Pending notification saved to AsyncStorage');
    } catch (e) {
      console.warn('[OneSignal] Failed to save pending notification:', e);
    }

    // Also try immediate navigation (works for foreground / background)
    navigate(targetScreen, payloadParams);
  } else {
    navigate('HomeMain');
  }
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // OneSignal is already initialized at module scope

        // Save push subscription ID to AsyncStorage when it changes
        OneSignal.User.pushSubscription.addEventListener(
          'change',
          async event => {
            const subscriptionId = event.current?.id;
            console.log('Push Subscription ID:', subscriptionId);

            if (subscriptionId) {
              await AsyncStorage.setItem(
                'onesignal_id',
                subscriptionId.toString(),
              );
              await AsyncStorage.setItem('device_type', Platform.OS.toString());
              console.log('OneSignal Subscription saved:', subscriptionId);
            }
          },
        );

        // console.log('OneSignal: Setup check hochche... Waiting for permission');

        const hasPermission = await OneSignal.Notifications.requestPermission(
          true,
        );

        console.log('OneSignal: Permission Allowed:', hasPermission);

        await PusherService.init();

        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.log('Initialization Error:', error);
        if (isMounted) setIsReady(true);
      }
    };

    init();

    return () => {
      isMounted = false;
      PusherService.disconnect();
    };
  }, []);

  const handleNavigationReady = () => {
    console.log(
      '[Nav] NavigationContainer is ready — flushing pending navigation',
    );
    flushPendingNavigation();
  };

  if (!isReady) {
    console.log('Waiting for App Initialization...');
    return null;
  }

  return (
    <CallProvider>
      <AuthProvider>
        <BookingProvider>
          <OtpSharedProvider>
            <NavigationContainer
              ref={navigationRef}
              onReady={handleNavigationReady}>
              <RootNavigator />
            </NavigationContainer>
          </OtpSharedProvider>
          <Toast config={toastConfig} />
        </BookingProvider>
      </AuthProvider>
    </CallProvider>
  );
}
