import React, {useEffect} from 'react';
import {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from '../navigation/AuthNavigator';
import HomeNavigator from './HomeNavigator';
import NotFound from '../screens/NotFound';
import {AuthContext} from '../context/AuthContext';
import {CallContext} from '../context/CallContext';
import {useAppConfig} from '../context/AppConfigContext';
import CallScreen from "../screens/Calling/CallScreen";
import IncomingCallModal from '../components/Calling/IncomingCallModal';
import MaintenanceScreen from '../screens/system/MaintenanceScreen';
import ForceUpdateScreen from '../screens/system/ForceUpdateScreen';
import {Modal} from 'react-native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {isLoggedIn, isLoading, userId} = useContext(AuthContext);
  const {incomingCall} = useContext(CallContext);
  const {
    isLoadingConfig,
    isMaintenance,
    isForceUpdate,
    isOptionalUpdate,
    dismissOptionalUpdate,
  } = useAppConfig();

  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [isLoggedIn]);

  // 1. Loading Splash State
  if (isLoading || isLoadingConfig || showSplash) {
    return <SplashScreen />;
  }

  // 2. Scheduled Maintenance Blocker
  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  // 3. Mandatory Force Update Blocker
  if (isForceUpdate) {
    return <ForceUpdateScreen isOptional={false} />;
  }

  const isCallValid =
    incomingCall &&
    userId &&
    String(userId) !== String(incomingCall?.caller_id);

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={HomeNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen name="NotFound" component={NotFound} />
        <Stack.Screen name="CallScreen" component={CallScreen} />
      </Stack.Navigator>

      {/* Optional Update Modal (can be dismissed by partner) */}
      {isOptionalUpdate && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={dismissOptionalUpdate}
        >
          <ForceUpdateScreen isOptional={true} onClose={dismissOptionalUpdate} />
        </Modal>
      )}

      {isCallValid && <IncomingCallModal />}
    </>
  );
}
