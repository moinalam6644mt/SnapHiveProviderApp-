import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PaymentMethodDrawer from '../../components/Recharge/PaymentMethodDrawer';
import { AuthUser } from '../../../api/authUser';
import { AuthContext } from '../../context/AuthContext';

import { theme } from '../../styles/globalStyles';
const RechargeWalletScreen = () => {
  const navigation = useNavigation();
  const { callApi } = AuthUser();
  const { userId } = useContext(AuthContext);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  const paymentFunction = async amount => {
    try {
      setLoading(true);

      const response = await callApi({
        method: 'CUSTOM_POST',
        api: `/user/payment_cashfree?worker_id=${userId}`,
        data: {
          amount: amount,
        },
      });

      console.log('Payment API Response:', JSON.parse(response?.response?.data));

      if (response?.response?.status === 1) {
        const data = JSON.parse(response?.response?.data);
        const order_id = data?.order_id;
        const payment_session_id = data?.payment_session_id;
        setOrderId(order_id);
        setSessionId(payment_session_id);

        if (order_id && payment_session_id) {
          setPaymentDrawerVisible(true);
        }
      }
    } catch (error) {
      console.warn('Payment API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ED6E0A" />
        </View>
      )}
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />

      {/* Keyboard dismiss wrapper */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color="#1e293b" strokeWidth={3} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Recharge Wallet</Text>
          </View>

          {/* Form Content */}
          <View style={styles.content}>
            <Text style={styles.label}>Amount</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={amount}
                onChangeText={text => setAmount(text)}
              />
            </View>
          </View>

          {/* Bottom Fixed Button */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomContainer}
          >
            <TouchableOpacity
              style={[styles.payBtn, { opacity: amount.length > 0 ? 1 : 0.6 }]}
              disabled={amount.length === 0}
              activeOpacity={0.8}
              onPress={() => paymentFunction(amount)}
            >
              <Text style={styles.payBtnText}>Continue to Pay</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      <PaymentMethodDrawer
        orderId={orderId}
        sessionId={sessionId}
        visible={paymentDrawerVisible}
        onClose={() => setPaymentDrawerVisible(false)}
        amount={amount}
        userId={userId}
      />
    </SafeAreaView>
  );
};

export default RechargeWalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? 32 : 10,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
    marginBottom: 8,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  input: {
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'Poppins-Regular',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    marginBottom: Platform.OS === 'android' ? 10 : 0,
  },
  payBtn: {
    backgroundColor: '#ED6E0A',
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  payBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Sora-SemiBold',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
