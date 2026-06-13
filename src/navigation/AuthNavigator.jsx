import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import CompleteProfileScreen from "../screens/auth/CompleteProfileScreen"
import VerificationScreen from "../screens/auth/VerificationScreen"
import VerificationLoginScreen from "../screens/auth/VerificationLoginScreen"
import OtpVerification from "../screens/auth/OtpVerification"

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      // initialRouteName="Login" 
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="VerificationLoginScreen" component={VerificationLoginScreen} />
      <Stack.Screen name="Otp" component={OtpVerification} />
    </Stack.Navigator>
  );
}
