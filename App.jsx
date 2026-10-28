import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { theme } from './src/styles/globalStyles';
import { BookingProvider } from './src/context/BookingContext';
import { AuthProvider } from './src/context/AuthContext';
import PusherService from './src/services/PusherService';
import { OtpSharedProvider } from './src/context/OtpSharedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CallProvider } from './src/context/CallContext';
// import RNCallKeep from 'react-native-callkeep';
import { AppConfigProvider } from './src/context/AppConfigContext';
import {
  navigationRef,
  navigate,
  flushPendingNavigation,
} from './src/services/NavigationService';

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

// ─── Setup CallKeep Listeners (Disabled for now - normal in-app calling used)
// RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
//   RNCallKeep.backToForeground();
//   // Get call data from somewhere or navigate
//   // But wait, we need incomingCall data. This will be handled in App component
// });

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {

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
    <AppConfigProvider>
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
    </AppConfigProvider>
  );
}
