import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useOtpShared } from '../../context/OtpSharedContext';

import { theme } from '../../styles/globalStyles';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OTPVerificationModal = ({ visible, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const inputs = useRef([]);
  const { bookingDetails, resetTrigger, onVerify } = useOtpShared();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    setOtp(['', '', '', '']);

    inputs.current.forEach(input => {
      if (input) input.blur();
    });

    setFocusedIndex(null);

    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }, [resetTrigger]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setOtp(['', '', '', '']);
      onClose();
    });
  };

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, ''); // Only numbers
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop click to close */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Close Button Top */}
          <TouchableOpacity onPress={handleClose} style={styles.closeCircle}>
            <X size={24} color="#404040" strokeWidth={3} />
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Header Section */}
            <View style={styles.header}>
              {bookingDetails?.status === '2' ? (
                <Text style={styles.title}>OTP for job start verification</Text>
              ) : (
                <Text style={styles.title}>OTP for job end verification</Text>
              )}
            </View>

            {/* Input Section */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                  ]}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectionColor={theme.danger}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => onVerify(otp.join(''))}
            >
              {bookingDetails?.status === '2' ? (
                <Text style={styles.verifyBtnText}>Verify OTP & Start</Text>
              ) : (
                <Text style={styles.verifyBtnText}>Verify OTP & End</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default OTPVerificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    alignItems: 'center',
  },
  closeCircle: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 40,
  },
  otpBox: {
    width: 64,
    height: 64,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1b4b',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  otpBoxFocused: {
    borderColor: theme.danger, // Red border on focus
    backgroundColor: 'white',
  },
  verifyBtn: {
    backgroundColor: '#47970B',
    marginHorizontal: 20,
    height: 52,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Sora',
  },
});
