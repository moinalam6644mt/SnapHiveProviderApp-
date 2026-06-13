import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

import {Pencil} from 'lucide-react-native';
import styles from './LoginStyle';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthUser} from '../../../api/authUser.js';
import StatusModal from '../../components/StatusModal.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../../context/AuthContext.jsx';
import {Screen} from 'react-native-screens';

const OtpVerification = () => {
  const {login, verifyOtpCentral} = React.useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const {callApi} = AuthUser();

  const mobileNumber = route.params?.mobile || '';
  const initialOtp = route.params?.otp || '';
  const firstName = route.params?.firstName || '';
  const lastName = route.params?.lastName || '';
  const isRegistration = !!firstName || !!lastName;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [debugOtp, setDebugOtp] = useState(initialOtp);

  // OTP error state
  const [otpError, setOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState('');

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMsg, setModalMsg] = useState('');

  const otpInputs = useRef([]);

  const showMsg = (type, msg) => {
    setModalType(type);
    setModalMsg(msg);
    setModalVisible(true);
  };

  // useEffect(() => {
  //   if (initialOtp) {
  //     const arr = initialOtp.toString().split('').slice(0, 4);
  //     setOtp(arr);
  //   }
  // }, []);

  useEffect(() => {
    let interval;

    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, canResend]);

  // ⭐ Handle OTP typing
  const handleOtpChange = (text, index) => {
    const value = text.replace(/[^0-9]/g, '');

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // Clear error when user starts typing
    if (otpError) {
      setOtpError(false);
      setOtpErrorMessage('');
    }

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Validate OTP
  const validateOtp = () => {
    const otpString = otp.join('');

    setOtpError(false);
    setOtpErrorMessage('');

    if (otpString.length !== 4) {
      setOtpError(true);
      setOtpErrorMessage('Please enter complete 4-digit OTP');
      return false;
    }

    return true;
  };

  // ⭐ RESEND OTP
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setCanResend(false);

    try {
      let apiEndpoint;
      let requestData;

      if (isRegistration) {
        apiEndpoint = '/sendSignupOtp';
        requestData = {
          number: mobileNumber,
          first_name: firstName,
          last_name: lastName,
        };
      } else {
        apiEndpoint = '/login_serviceProvider';
        requestData = {
          mobile: mobileNumber,
          step: '1',
        };
      }

      const resp = await callApi({
        api: apiEndpoint,
        method: 'CUSTOM_POST',
        data: requestData,
      });

      console.log('RESEND RESPONSE:', resp);

      const newOtp =
        resp?.response?.otp ||
        resp?.response?.data?.otp ||
        resp?.data?.otp ||
        null;

      if (resp?.status === 1) {
        setTimer(30);
        setOtp(['', '', '', '']);

        if (newOtp) {
          setDebugOtp(newOtp);
        }

        showMsg('success', 'OTP resent successfully');
      } else {
        const serverError =
          resp?.response?.errors?.[0]?.message ||
          (typeof resp?.response?.errors === 'string'
            ? resp?.response?.errors
            : null) ||
          resp?.response?.message ||
          'Failed to resend OTP';
        // Allow the user to try again without waiting the full timer.
        setTimer(0);
        setCanResend(true);
        showMsg('error', serverError);
      }
    } catch (e) {
      console.log('Resend OTP error:', e);
      setTimer(0);
      setCanResend(true);
      showMsg('error', 'Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ⭐ VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    setLoading(true);

    try {
      if (isRegistration) {
        // Registration verification API logic
        const apiEndpoint = '/verify_otp';
        const requestData = {
          number: mobileNumber,
          otp: otp.join(''),
          first_name: firstName,
          last_name: lastName,
        };

        const resp = await callApi({
          api: apiEndpoint,
          method: 'CUSTOM_POST',
          data: requestData,
        });

        if (resp?.status === 1) {
          await AsyncStorage.setItem(
            'user_data',
            JSON.stringify(resp?.response?.data),
          );
          showMsg('success', 'OTP Verified Successfully');
          setTimeout(() => {
            navigation.replace('LocationPermission');
          }, 800);
        } else {
          showMsg('error', resp?.message || 'Invalid OTP');
        }
      } else {
        // Centralized Login Verification Logic
        const response = await verifyOtpCentral(
          mobileNumber,
          otp.join(''),
          '2',
        );

        console.log(
          'OTP VERIFY RESPONSE:',
          response?.response?.data?.login_status,
        );

        if (response?.status === 1) {
          const loginStatus = response?.response?.data?.login_status;

          if (loginStatus == 1) {
            const fullUserData = response?.response?.data;

            showMsg('success', 'Login Successful');

            setTimeout(() => {
              login(fullUserData); // This updates AuthContext and automatically switches to HomeMain
            }, 1200);
          } else if (loginStatus == 0) {
            setTimeout(() => {
              navigation.replace('VerificationLoginScreen');
            }, 1200);
          } else {
            showMsg('error', 'Unexpected login status');
          }
        } else {
          showMsg(
            'error',
            response?.response?.errors?.[0]?.message ||
              response?.response?.message ||
              'OTP Verification Failed',
          );
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      showMsg('error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMobileNumber = n =>
    n ? `+91 ${n.slice(0, 5)} ${n.slice(5)}` : '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* TOP */}
        <View style={styles.topSection}>
          <ImageBackground
            source={require('../../../assets/images/background_image.png')}
            style={styles.topBg}>
            <Image
              source={require('../../../assets/images/logo1.png')}
              style={styles.logo}
            />
            <Text style={styles.tagline}>Powered by People</Text>
          </ImageBackground>
        </View>

        <View style={styles.bottomSection} />

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>OTP Verification</Text>

          <View style={styles.mobileNumberContainer}>
            <Text style={styles.mobileNumberText}>Enter code sent to</Text>

            <View style={styles.mobileNumberRow}>
              <Text style={styles.mobileNumber}>
                {formatMobileNumber(mobileNumber)}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={loading}>
                <Pencil size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Show user's name during registration */}
            {isRegistration && (
              <Text style={styles.userNameText}>
                {firstName} {lastName}
              </Text>
            )}
          </View>

          {/* OTP INPUT CONTAINER */}
          <View style={styles.otpContainerWrapper}>
            <View style={[styles.otpContainer, otpError]}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  ref={r => (otpInputs.current[i] = r)}
                  style={[styles.otpInput, otpError && styles.otpInputError]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={d}
                  onChangeText={t => handleOtpChange(t, i)}
                  onKeyPress={({nativeEvent}) => {
                    if (nativeEvent.key === 'Backspace' && !d && i > 0)
                      otpInputs.current[i - 1]?.focus();
                  }}
                  editable={!loading}
                />
              ))}
            </View>
            {otpError && otpErrorMessage && (
              <Text style={styles.otpErrorText}>{otpErrorMessage}</Text>
            )}
          </View>

          {/* RESEND */}
          <View style={styles.resendContainer}>
            <Text>Didn't get it?</Text>

            <TouchableOpacity
              disabled={!canResend || resendLoading}
              onPress={handleResendOtp}>
              {resendLoading ? (
                <ActivityIndicator size="small" color="#3b2e83" />
              ) : (
                <Text
                  style={[
                    styles.timerText,
                    !canResend && styles.timerTextDisabled,
                  ]}>
                  {canResend
                    ? 'Resend OTP'
                    : `00:${timer.toString().padStart(2, '0')}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* VERIFY */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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

export default OtpVerification;
