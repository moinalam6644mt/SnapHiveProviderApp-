import React, {useEffect} from 'react';
import {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from '../navigation/AuthNavigator';
import HomeNavigator from './HomeNavigator';
import NotFound from '../screens/NotFound';
import {AuthContext} from '../context/AuthContext';
import CallScreen from "../screens/Calling/CallScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {isLoggedIn, isLoading} = useContext(AuthContext);
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowSplash(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 1500);
    }
  }, [isLoggedIn]);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={HomeNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen name="NotFound" component={NotFound} />
      <Stack.Screen name="CallScreen" component={CallScreen} />
    </Stack.Navigator>
  );
}
