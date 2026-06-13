import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  Plus,
} from 'lucide-react-native';
import {
  CFPaymentGatewayService,
  CFErrorResponse,
} from 'react-native-cashfree-pg-sdk';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { CFSession, CFEnvironment } from 'cashfree-pg-api-contract';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PaymentMethodDrawer = ({
  visible,
  onClose,
  amount = '',
  orderId,
  sessionId,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const PaymentOption = ({ icon, title, onPress, isStaticImage = false }) => (
    <TouchableOpacity
      style={styles.optionRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <View style={styles.iconContainer}>
          {isStaticImage ? (
            <Image
              source={icon}
              style={styles.staticIcon}
              resizeMode="contain"
            />
          ) : (
            icon
          )}
        </View>
        <Text style={styles.optionText}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#1e1b4b" />
    </TouchableOpacity>
  );

  const startPayment = () => {
    try {
      const session = new CFSession(
        sessionId, // payment_session_id
        orderId, // order_id
        CFEnvironment.SANDBOX,
      );

      CFPaymentGatewayService.doWebPayment(session);
    } catch (e) {
      console.warn('Payment Error:', e.message);
    }
  };

  useEffect(() => {
    CFPaymentGatewayService.setCallback({
      onVerify: orderID => {
        console.warn('Payment Success:', orderID);

        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: 'Your recharge was completed successfully.',
        });

        setTimeout(() => {
          handleClose();

          navigation.replace('Main', {
            screen: 'Wallet',
            orderId: orderID,
            amount: amount,
          });
        }, 1000);
      },

      onError: (error, orderID) => {
        console.warn('Payment Failed:', error);

        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: 'Please try again.',
          position: 'top',
        });
      },
    });

    return () => {
      CFPaymentGatewayService.removeCallback();
    };
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.drawer, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
              <ChevronLeft size={24} color="#0f172a" strokeWidth={3} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Select Payment Method</Text>
              <Text style={styles.headerSubTitle}>
                Amount to recharge: ₹{amount}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollBody}
          >
            {/* UPI Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>UPI</Text>
              <PaymentOption
                title="Google Pay"
                isStaticImage
                style={styles.gpayIcon}
                icon={require('../../../assets/app/paymentMethods/gpay.png')}
                onPress={startPayment}
              />
              <View style={styles.divider} />
              <PaymentOption
                title="Add New UPI ID"
                onPress={startPayment}
                icon={<Plus size={22} color="#f97316" />}
              />
            </View>

            {/* Cards Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cards</Text>
              <PaymentOption
                onPress={startPayment}
                title="Add New Card"
                icon={<CreditCard size={22} color="#f97316" />}
              />
            </View>

            {/* Net Banking Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Net banking</Text>
              <PaymentOption
                onPress={startPayment}
                title="Net Banking"
                icon={<Landmark size={22} color="#1e1b4b" />}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PaymentMethodDrawer;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: 15 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    fontFamily: 'Sora-Bold',
  },
  headerSubTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Sora-SemiBold',
  },

  scrollBody: { flex: 1 },
  section: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
    paddingHorizontal: 20,
    marginBottom: 5,
    fontFamily: 'Sora-Bold',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    // backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: '#e5e8ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gpayIcon: {
    backgroundColor: 'transparent',
    width: 30,
    height: 30,
  },
  staticIcon: { width: 50, height: 50 },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Sora-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 85,
    marginRight: 20,
  },
});