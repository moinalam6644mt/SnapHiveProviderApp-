import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Phone, ArrowRight } from 'lucide-react-native';
import styles from './LoginStyle';
import { useNavigation } from '@react-navigation/native';
import { AuthUser } from '../../../api/authUser.js';
import StatusModal from '../../components/StatusModal.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const { callApi } = AuthUser();
  const navigation = useNavigation();

  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const [mobileError, setMobileError] = useState(false);
  const [mobileErrorMessage, setMobileErrorMessage] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('error');
  const [modalMsg, setModalMsg] = useState('');

  const showError = (msg) => {
    setModalType('error');
    setModalMsg(msg);
    setModalVisible(true);
  };

  const validateForm = () => {
    setMobileError(false);
    setMobileErrorMessage('');
    if (!mobileNumber.trim()) {
      setMobileError(true);
      setMobileErrorMessage('Please enter mobile number');
      return false;
    } else if (mobileNumber.length !== 10) {
      setMobileError(true);
      setMobileErrorMessage('Enter 10 digit mobile number');
      return false;
    } else if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setMobileError(true);
      setMobileErrorMessage('Enter valid Indian mobile number');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const resp = await callApi({
        api:`/login_serviceProvider`,
        method:'CUSTOM_POST',
        data:{
          mobile: mobileNumber,
          step: '1',
        },
      });
      console.log('Login Response:', resp);
      if (resp?.status === 1) {
        const otp =
          resp?.response?.otp ||
          resp?.response?.data?.otp ||
          null;

        navigation.navigate('Otp', {
          mobile: mobileNumber,
          otp: otp,
        });
      } else {
        const errorMessage =
          resp?.response?.errors ||
          resp?.errors ||
          'Failed to send OTP';

        showError(errorMessage);
      }

    } catch (error) {
      console.log('Error Details:', error);
      
      // Extract meaningful error message from API response
      let errorMessage = 'Network error. Please try again.';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status) {
        // HTTP status error
        errorMessage = `Error: ${error.response.status}. Please try again.`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setMobileNumber(numericText);
    if (mobileError) {
      setMobileError(false);
      setMobileErrorMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* TOP */}
            <View style={styles.topSection}>
              <Image
                source={require('../../../assets/images/logo1.png')}
                style={styles.logo}
              />
              <Text style={styles.tagline}>Powered by People</Text>
            </View>

            {/* BOTTOM SHEET */}
            <View style={styles.bottomSheet}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number to login
              </Text>

              {/* MOBILE INPUT WITH ERROR HANDLING */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  mobileError && styles.inputError
                ]}>
                  <Phone 
                    size={20} 
                    color={mobileError ? "#FF6B6B" : "#6B7280"} 
                  />
                  <TextInput
                    placeholder="Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={handleMobileChange}
                    editable={!loading}
                  />
                </View>
                {mobileError && mobileErrorMessage && (
                  <Text style={styles.errorText}>{mobileErrorMessage}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.buttonContainer, loading && styles.buttonDisabled]}
                activeOpacity={0.85}
                onPress={handleContinue}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#134E5E', '#71B280']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </Text>
                  {!loading && <ArrowRight size={20} color="#FFFFFF" style={{marginLeft: 8}} />}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={[styles.skip, loading && { opacity: 0.5 }]}>
                  Register now
                </Text>
              </TouchableOpacity>
              <View style={styles.bottomSection}>
                <Text style={styles.terms}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.link}>T&C</Text> and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* STATUS MODAL - Only for API errors */}
      <StatusModal
        visible={modalVisible}
        type={modalType}
        message={modalMsg}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Login;