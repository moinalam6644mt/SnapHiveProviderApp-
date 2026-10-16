import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import StatusModal from '../../components/StatusModal.jsx';
import { AuthUser } from '../../../api/authUser.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const FloatingLabelInput = ({
  icon,
  label,
  value,
  onChangeText,
  error,
  isPassword,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, isFocused, value]);

  const topStyle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -10],
  });

  const fontSizeStyle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', '#1BA9A2'],
  });

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderWidth: 1.5,
          borderColor: error ? '#EF4444' : isFocused ? '#1BA9A2' : '#E5E7EB',
          borderRadius: 14,
          height: 56,
          paddingHorizontal: 16,
        }}
      >
        <Icon
          name={icon}
          size={20}
          color={error ? '#EF4444' : isFocused ? '#1BA9A2' : '#9CA3AF'}
        />
        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
          <Animated.Text
            style={{
              position: 'absolute',
              left: -4,
              top: topStyle,
              fontSize: fontSizeStyle,
              color: error ? '#EF4444' : labelColor,
              backgroundColor: '#ffffff',
              paddingHorizontal: 4,
              zIndex: 1,
            }}
          >
            {label}
          </Animated.Text>
          <TextInput
            {...props}
            style={[{ flex: 1, fontSize: 15, color: '#111827', height: '100%', paddingTop: (isFocused || value) ? 12 : 0 }]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isPassword && !showPassword}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
          />
        </View>
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
            <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>{error}</Text> : null}
    </View>
  );
};

const Login = () => {
  const navigation = useNavigation();
  const { callApi } = AuthUser();
  const { login } = useContext(AuthContext);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('error');
  const [modalMsg, setModalMsg] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '601679475180-218vcc0spvb4idk43fpu7oi6cdsnngnf.apps.googleusercontent.com',
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = (msg) => { setModalType('error'); setModalMsg(msg); setModalVisible(true); };
  const showSuccess = (msg) => { setModalType('success'); setModalMsg(msg); setModalVisible(true); };

  const validateForm = () => {
    setEmailError(false); setEmailErrorMessage('');
    setPasswordError(false); setPasswordErrorMessage('');

    if (!email.trim()) {
      setEmailError(true); setEmailErrorMessage('Please enter your email'); return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true); setEmailErrorMessage('Please enter a valid email'); return false;
    }
    if (!password) {
      setPasswordError(true); setPasswordErrorMessage('Please enter your password'); return false;
    }
    return true;
  };

  const saveAndNavigate = async (resp, emailVal) => {
    const dataObj = resp?.response?.data || resp?.response || resp?.data || resp;
    const workerId = dataObj?.worker_id || dataObj?.member_id;
    const workerName = dataObj?.worker_name || dataObj?.profile_name || dataObj?.name || 'User';
    const workerPhone = dataObj?.worker_phone || dataObj?.phone || '';
    const workerEmail = dataObj?.worker_email || emailVal;
    const loginStatus = dataObj?.login_status ?? resp?.response?.login_status;

    const userData = {
      worker_id: workerId,
      member_id: workerId,
      member_token: dataObj?.token || dataObj?.member_token || null,
      token: dataObj?.token || dataObj?.member_token || null,
      worker_name: workerName,
      profile_name: workerName,
      worker_phone: workerPhone,
      phone: workerPhone,
      worker_email: workerEmail,
      email: workerEmail,
      logo: dataObj?.logo || null,
      login_status: loginStatus,
    };

    if (String(loginStatus) !== '1') {
      // Worker is pending admin approval
      setModalVisible(false);
      setLoading(false);
      setGoogleLoading(false);
      navigation.navigate('VerificationLoginScreen');
      return;
    }

    if (login) {
      await login(userData);
    } else {
      await AsyncStorage.setItem('authData', JSON.stringify(userData));
      await AsyncStorage.setItem('member_data', JSON.stringify({ data: userData }));
    }
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('on_boarding', '1');

    setTimeout(() => {
      setModalVisible(false);
      setLoading(false);
      setGoogleLoading(false);
    }, 1200);
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const resp = await callApi({
        api: '/login_serviceProvider', 
        method: 'CUSTOM_POST',
        data: { email: email.trim(), password, step: '3' },
      });
      if (resp?.status === 1 || resp?.success === true) {
        showSuccess(resp?.response?.message || resp?.message || 'Login successful!');
        await saveAndNavigate(resp, email.trim());
      } else {
        const responseErrors = resp?.response?.errors;
        const apiError = typeof responseErrors === 'string' ? responseErrors : responseErrors?.[0]?.message;
        showError(apiError || resp?.response?.message || resp?.message || 'Login Failed.');
        setLoading(false);
      }
    } catch (error) {
      showError(error.message || 'Login Failed');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setModalVisible(false);
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // ignore if not already signed in
      }
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') {
        showError('Google Sign-In was cancelled. Please try again.');
        setGoogleLoading(false);
        return;
      }
      
      const user = response?.data?.user || response?.user || {};
      const google_id = user?.id || '';
      const googleEmail = (user?.email || '').trim();
      const name = user?.name || '';

      if (!googleEmail) {
        showError('Google email not received. Please try again.');
        setGoogleLoading(false);
        return;
      }

      // Check if account already exists for this email
      let checkResp;
      try {
        checkResp = await callApi({
          api: '/login_serviceProvider',
          method: 'CUSTOM_POST',
          data: {
            email: googleEmail,
            password: 'check_account_exists_temp',
            step: '3',
          },
        });
      } catch (err) {
        checkResp = err?.response?.data;
      }

      const emailErrors = checkResp?.response?.errors;
      const isAccountNotFound = Array.isArray(emailErrors)
        ? emailErrors.some(err => err?.id === 'email' || String(err?.message || '').toLowerCase().includes('no worker account found'))
        : typeof emailErrors === 'string' && emailErrors.toLowerCase().includes('no worker account');

      if (isAccountNotFound) {
        // Account does not exist -> Redirect to Create Account (Register)
        setGoogleLoading(false);
        await GoogleSignin.signOut();
        Toast.show({
          type: 'info',
          text1: 'No Account Found',
          text2: 'Please complete your registration to create your account.',
        });
        navigation.navigate('Register', {
          name: name,
          email: googleEmail,
          google_id: google_id,
        });
        return;
      }
      
      const resp = await callApi({
        api: '/google_login_serviceProvider',
        method: 'CUSTOM_POST',
        data: {
          google_id: google_id,
          email:     googleEmail,
          name:      name,
          mobile:    '',
        },
      });
      
      if (resp?.status === 1 || resp?.success === true) {
        showSuccess(resp?.response?.message || resp?.message || 'Google Login successful!');
        await saveAndNavigate(resp, googleEmail);
      } else {
        const responseErrors = resp?.response?.errors;
        const apiError = typeof responseErrors === 'string' ? responseErrors : responseErrors?.[0]?.message;
        showError(apiError || resp?.response?.message || resp?.message || 'Google Login Failed.');
        setGoogleLoading(false);
        await GoogleSignin.signOut();
      }
    } catch (error) {
      setGoogleLoading(false);
      showError(error.message || 'Google Login Failed');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

              {/* Title */}
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                Welcome Back!
              </Text>
              <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 36, lineHeight: 22 }}>
                Sign in to continue to your provider account
              </Text>

              {/* Email Input */}
              <FloatingLabelInput
                ref={emailRef}
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(false); }}
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
                icon="mail-outline"
                error={emailError ? emailErrorMessage : null}
              />

              {/* Password Input */}
              <FloatingLabelInput
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(false); }}
                onSubmitEditing={handleContinue}
                returnKeyType="done"
                icon="lock-closed-outline"
                isPassword={true}
                error={passwordError ? passwordErrorMessage : null}
              />

              {/* Sign In Button */}
              <TouchableOpacity
                style={{
                  height: 56, borderRadius: 14,
                  overflow: 'hidden',
                  opacity: (loading || googleLoading) ? 0.7 : 1,
                  shadowColor: '#1BA9A2', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                }}
                onPress={handleContinue}
                disabled={loading || googleLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1BA9A2', '#0A736F']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 }}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                <Text style={{ color: '#9CA3AF', paddingHorizontal: 14, fontSize: 13, fontWeight: '500' }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#ffffff',
                  borderWidth: 1.5, borderColor: '#E5E7EB',
                  height: 56, borderRadius: 14,
                  flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                  opacity: (loading || googleLoading) ? 0.7 : 1,
                }}
                onPress={handleGoogleLogin}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#1BA9A2" size="small" />
                ) : (
                  <>
                    <Image
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                      style={{ width: 22, height: 22, marginRight: 10 }}
                    />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={{ marginTop: 28, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>
                    Don't have an account?{' '}
                    <Text style={{ color: '#1BA9A2', fontWeight: '700' }}>Sign up now</Text>
                  </Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 18, textAlign: 'center', lineHeight: 16 }}>
                  By continuing, you agree to our{' '}
                  <Text style={{ color: '#1BA9A2', fontWeight: '600' }} onPress={() => Linking.openURL('https://www.snaphive.online/terms-and-conditions')}>Terms</Text>
                  {' '}&{' '}
                  <Text style={{ color: '#1BA9A2', fontWeight: '600' }} onPress={() => Linking.openURL('https://www.snaphive.online/privacy-policy')}>Privacy Policy</Text>
                </Text>
              </View>

            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <StatusModal
        visible={modalVisible}
        type={modalType}
        message={modalMsg}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Login;