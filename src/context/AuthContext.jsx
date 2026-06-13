import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthUser} from '../../api/authUser';
import PusherService from '../services/PusherService';
import {CallContext} from './CallContext';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [onesignalId, setOnesignalId] = useState(null);
  const [deviceType, setDeviceType] = useState('');

  const {callApi} = AuthUser();
  const {showIncomingCall, hideIncomingCall, triggerEndCall} =
    useContext(CallContext);
  const isCallListenerReadyRef = useRef(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('authData');

        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          setUserData(parsed);
          setUserId(parsed?.member_id);
          setUserToken(parsed?.token || null);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.warn('Load User Error:', error);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      isCallListenerReadyRef.current = false;
      return;
    }
    if (isCallListenerReadyRef.current) {
      return;
    }
    isCallListenerReadyRef.current = true;

    const setupCallListener = async () => {
      try {
        console.log('📡 AuthContext: Subscribing Pusher after login...');
        console.log('👤 User ID:', userId);

        await PusherService.subscribeMultiple('audio-video-call', {
          incoming_call: event => {
            console.log('📞 INCOMING CALL EVENT RAW:', event);

            const parsedData = JSON.parse(event.data);

            console.log('📞 Parsed Call Data:', parsedData);

            // Match this worker against the booking's provider_id, using
            // string comparison because Pusher payloads can arrive as either
            // numeric or string IDs and strict equality silently fails.
            const providerId = parsedData?.provider_id;
            const callerType = parsedData?.call_by;
            const currentUserType = 'worker';
            const isForMe =
              providerId != null &&
              String(providerId) === String(userId) &&
              callerType !== currentUserType;
            if (isForMe) {
              showIncomingCall(parsedData);
            }
          },
        });

        await PusherService.subscribeMultiple('end-video-call', {
          end_call: event => {
            console.log('📴 END CALL EVENT:', event);
            let parsedData = null;
            try {
              parsedData = event?.data ? JSON.parse(event.data) : null;
            } catch (e) {
              console.log('⚠️ END CALL parse failed:', e);
            }
            hideIncomingCall();
            triggerEndCall(parsedData);
          },
        });

        console.log('✅ AuthContext: Pusher subscriptions ready');
      } catch (error) {
        console.log('❌ AuthContext Pusher Subscribe Error:', error);
        isCallListenerReadyRef.current = false;
      }
    };

    setupCallListener();

    return () => {
      isCallListenerReadyRef.current = false;
      PusherService.unsubscribe('audio-video-call');
      PusherService.unsubscribe('end-video-call');
    };
  }, [
    isLoggedIn,
    userId,
    showIncomingCall,
    hideIncomingCall,
    triggerEndCall,
  ]);

  const login = async fullUserData => {
    try {
      await AsyncStorage.setItem('authData', JSON.stringify(fullUserData));

      setUserData(fullUserData);
      setUserId(fullUserData?.member_id);
      setUserToken(fullUserData?.token || null);
      setIsLoggedIn(true);
    } catch (error) {
      console.warn('Login Save Error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authData');

      setUserId(null);
      setUserToken(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.warn('Logout Error:', error);
    }
  };

  const verifyOtpCentral = async (mobile, otp, step) => {
    try {
      const payload = {
        mobile: mobile,
        otp: otp,
        step: step || '2',
      };

      const response = await callApi({
        method: 'CUSTOM_POST',
        api: '/login_serviceProvider',
        data: payload,
      });

      return response;
    } catch (error) {
      console.warn('verifyOtpCentral error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        userId,
        userToken,
        isLoggedIn,
        isLoading,
        login,
        logout,
        verifyOtpCentral,
        onesignalId,
        deviceType,
        setOnesignalId,
        setDeviceType,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
