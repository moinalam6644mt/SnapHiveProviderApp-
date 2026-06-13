import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthUser } from '../../../api/authUser';

export default function MarkPaid({ isPayment, workerId,orderId }) {
  const navigation = useNavigation();
  const { callApi } = AuthUser();

  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(isPayment == 1);

  useEffect(() => {
    setIsPaid(isPayment == 1);
  }, [isPayment]);

  const handleMarkPaid = async () => {
    if (isPaid) return;

    try {
      setLoading(true);

      const res = await callApi({
        method: 'CUSTOM_POST',
        api: `/mark_as_paid?worker_id=${workerId}`,
        data: {
          order_id: orderId,
        },
      });


      setIsPaid(true);

      Toast.show({
        type: 'success',
        text1: 'Payment marked successfully',
      });

    } catch (error) {
      console.warn("ERROR", error);

      Toast.show({
        type: 'error',
        text1: 'Failed to mark payment',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.startBtn,
        (isPaid || loading) && styles.disabledBtn,
      ]}
      onPress={handleMarkPaid}
      disabled={isPaid || loading}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="white" size="small" />
          <Text style={[styles.startBtnText, { marginLeft: 10 }]}>
            Processing...
          </Text>
        </View>
      ) : (
        <Text style={styles.startBtnText}>
          {isPaid ? 'Marked as Paid' : 'Mark as Paid'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    backgroundColor: '#2FCA00',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,

    marginHorizontal: 20,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
