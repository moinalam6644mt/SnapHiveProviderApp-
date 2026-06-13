import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import {CallContext} from '../../context/CallContext';
import {useNavigation} from '@react-navigation/native';
import {Phone, User} from 'lucide-react-native';
import {AuthUser} from '../../../api/authUser';

const {width} = Dimensions.get('window');

const IncomingCallModal = () => {
  const {callApi} = AuthUser();
  const navigation = useNavigation();
  const {callVisible, incomingCall, hideIncomingCall, resetEndCall} =
    useContext(CallContext);
  const [customerName, setCustomerName] = React.useState('Customer');

  const timeoutRef = useRef(null);
  const isDecliningRef = useRef(false);
  // Animation value
  const slideAnim = useRef(new Animated.Value(width)).current;
  const swipeYAnim = useRef(new Animated.Value(0)).current;

  const getBookingDetails = useCallback(async () => {
    const worker_id = incomingCall?.provider_id;
    const bookingId = incomingCall?.booking_id;
    if (!worker_id || !bookingId) {
      return;
    }
    const resp = await callApi({
      method: 'GET',
      api: `/booking_details?worker_id=${worker_id}&booking_id=${bookingId}`,
      data: {},
    });

    setCustomerName(resp?.response?.data?.['booking-det']?.customer_name);
  }, [callApi, incomingCall?.booking_id, incomingCall?.provider_id]);

  useEffect(() => {
    getBookingDetails();
  }, [getBookingDetails]);

  useEffect(() => {
    if (callVisible && incomingCall) {
      // animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // start 10 sec timer
      timeoutRef.current = setTimeout(async () => {
        await callApi({
          method: 'CUSTOM_POST',
          api: `/user/end_call?member_id=${incomingCall.provider_id}`,
          data: {
            booking_id: incomingCall.booking_id,
            roomId: incomingCall.roomId,
          },
        });

        hideIncomingCall();
      }, 60000); // 1 minute
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callVisible, incomingCall, callApi, hideIncomingCall, slideAnim]);

  const handleAccept = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isDecliningRef.current = false;
    // Ensure previous call-end signal cannot terminate this newly accepted call.
    resetEndCall();
    hideIncomingCall();
    navigation.navigate('CallScreen', {...incomingCall});
  };
  const handleDecline = useCallback(async () => {
    if (isDecliningRef.current) {
      return;
    }
    if (!incomingCall) {
      return;
    }
    isDecliningRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await callApi({
        method: 'CUSTOM_POST',
        api: `/user/end_call?member_id=${incomingCall.provider_id}`,
        data: {
          booking_id: incomingCall.booking_id,
          roomId: incomingCall.roomId,
        },
      });
    } finally {
      hideIncomingCall();
      swipeYAnim.setValue(0);
      isDecliningRef.current = false;
    }
  }, [callApi, hideIncomingCall, incomingCall, swipeYAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 8;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          swipeYAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: async (_, gestureState) => {
        if (gestureState.dy < -60) {
          await handleDecline();
          return;
        }
        Animated.spring(swipeYAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 60,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeYAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 60,
        }).start();
      },
    }),
  ).current;

  if (!incomingCall) {
    return null;
  }

  return (
    <Modal
      visible={callVisible}
      transparent
      animationType="none"
      onRequestClose={handleDecline}>
      <View style={styles.overlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bannerContainer,
            {transform: [{translateX: slideAnim}, {translateY: swipeYAnim}]},
          ]}>
          {/* Subtle Gradient-like feel with minimal design */}
          <View style={styles.contentWrapper}>
            <View style={styles.callerSection}>
              <View style={styles.avatarWrapper}>
                {incomingCall?.avatar ? (
                  <Image
                    source={{uri: incomingCall.avatar}}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={28} color="#FFF" />
                  </View>
                )}
                <View style={styles.videoBadge}>
                  <Phone size={12} color="#FFF" fill="#FFF" />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.incomingText}>Incoming Call...</Text>
                <Text style={styles.nameText} numberOfLines={1}>
                  {customerName || 'Customer'}
                </Text>
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[styles.iconButton, styles.declineBtn]}
                onPress={handleDecline}>
                <Phone size={22} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconButton, styles.acceptBtn]}
                onPress={handleAccept}>
                <Phone size={22} color="#FFF" fill="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default IncomingCallModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-end', // Right side e align korbe
  },
  bannerContainer: {
    width: width * 0.9, // Screen er 90% width
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginRight: 15,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glass effect base
    padding: 4,
    // Premium Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 20,
  },
  callerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: '#6366F1', // Indigo color
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    padding: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  incomingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 2,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 10,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#FF4757',
  },
  acceptBtn: {
    backgroundColor: '#2ED573',
  },
});
