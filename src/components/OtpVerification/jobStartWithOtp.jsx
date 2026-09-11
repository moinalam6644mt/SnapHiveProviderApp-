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
          <View style={styles.card}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

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
              style={styles.verifyBtnContainer}
              activeOpacity={0.8}
              onPress={() => onVerify(otp.join(''))}
            >
              <View style={styles.verifyBtnSolid}>
                {bookingDetails?.status === '2' ? (
                  <Text style={styles.verifyBtnText}>Verify OTP & Start</Text>
                ) : (
                  <Text style={styles.verifyBtnText}>Verify OTP & End</Text>
                )}
              </View>
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
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: 'Sora',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 40,
  },
  otpBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  otpBoxFocused: {
    borderColor: theme.primary, 
    borderWidth: 1.5,
    backgroundColor: 'white',
  },
  verifyBtnContainer: {
    marginHorizontal: 20,
    height: 52,
    borderRadius: 27,
    overflow: 'hidden',
  },
  verifyBtnSolid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primary,
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Sora',
  },
});
