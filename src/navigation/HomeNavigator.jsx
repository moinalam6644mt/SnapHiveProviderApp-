import React, {useContext, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import JobScreen from '../screens/jobs/JobScreen';
import JobDetailsScreen from '../screens/jobs/JobDetailsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import RechargeWalletScreen from '../screens/wallet/RechargeWalletScreen';
import ChatListScreen from '../screens/Message/ChatListScreen';
import ChatDetailsScreen from '../screens/Message/ChatDetailsScreen';
import WebViewScreen from '../screens/WebView';
import IncomingCallModal from '../components/Calling/IncomingCallModal';
import {AuthContext} from '../context/AuthContext';
import {BookingContext} from '../context/BookingContext';
import {CallContext} from '../context/CallContext';
import NotificationHandlingScreen from '../screens/NotificationHandlingScreen';
import CancelledBookingScreen from '../screens/CancelledBookingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationRef} from '../services/NavigationService';

const Stack = createNativeStackNavigator();

export default function HomeNavigation() {
  const {userId} = useContext(AuthContext);
  const {currentBookingId} = useContext(BookingContext);
  const {incomingCall} = useContext(CallContext);

  console.log('Current Booking ID:', currentBookingId);
  console.log('User ID:', userId);
  console.log('Incoming Call Data:', incomingCall);

  // ─── Killed-state notification handler ──────────────────────────────────────
  // This runs once when HomeNavigator mounts (i.e. after splash + auth loading).
  // By this point the navigator IS ready, so we can safely navigate.
  // NotificationHandling is registered in this navigator, so the screen exists.
  useEffect(() => {
    const checkPendingNotification = async () => {
      try {
        const raw = await AsyncStorage.getItem('pending_notification');
        if (!raw) return;

        // Clear it immediately so it doesn't fire again on future renders
        await AsyncStorage.removeItem('pending_notification');

        const parsedData = JSON.parse(raw);
        const {screen, ...params} = parsedData;
        console.log(
          '[HomeNavigator] Pending notification found → navigating to',
          screen,
          'params:',
          params,
        );

        if (screen && navigationRef.isReady()) {
          navigationRef.navigate(screen, params);
        }
      } catch (e) {
        console.warn('[HomeNavigator] Failed to read pending notification:', e);
      }
    };

    checkPendingNotification();
  }, []); // runs once on mount

  const isCallValid =
    incomingCall &&
    userId &&
    String(userId) !== String(incomingCall?.caller_id);

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="JobScreen" component={JobScreen} />
        <Stack.Screen name="JobDetailsScreen" component={JobDetailsScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="RechargeScreen" component={RechargeWalletScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen
          name="NotificationHandling"
          component={NotificationHandlingScreen}
        />
        <Stack.Screen
          name="CancelledBookingScreen"
          component={CancelledBookingScreen}
        />
      </Stack.Navigator>
      {isCallValid && <IncomingCallModal />}
    </>
  );
}
