import React, {useEffect, useRef, useMemo} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {calculateAmount} from '../../../services/calculateAmount';
import { theme } from '../../../styles/globalStyles';

const EndHeader = ({
  bookingDetails,
  providerDetails,
  elapsedSeconds,
  formatTime,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isCompleted = bookingDetails?.status === '4';

  const startDate = useMemo(() => {
    if (!providerDetails?.start_time) return null;
    return new Date(providerDetails.start_time.replace(' ', 'T'));
  }, [providerDetails]);

  const formattedStartTime = useMemo(() => {
    if (!startDate) return '--';
    return startDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [startDate]);

  const totalDurationSeconds =
    parseFloat(bookingDetails?.duration_hours || 0) * 3600;

  const amountData = useMemo(() => {
    return calculateAmount({
      duration_hours: bookingDetails?.duration_hours,
      rate: bookingDetails?.rate,
      ot_price_per_minute: bookingDetails?.ot_price_per_minute,
      worked_minutes: elapsedSeconds / 60,
      cancelCharge: providerDetails?.previous_cancel_charge,
    });
  }, [bookingDetails, providerDetails, elapsedSeconds]);

  const {workingSeconds, overtimeSeconds, baseAmount, otAmount, isOvertime} =
    amountData;

  const currentAmount = parseFloat(baseAmount + otAmount).toFixed(2);
  const otPricePerMinute = parseFloat(bookingDetails?.ot_price_per_minute || 0);

  const progressPercent = totalDurationSeconds
    ? Math.min(workingSeconds / totalDurationSeconds, 1)
    : 0;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Services {isCompleted ? 'Completed' : 'In Progress'}
        </Text>

        {/* Progress Bar */}
        {!isCompleted && (
          <View style={styles.progressBackground}>
            <Animated.View style={{width: progressWidth}}>
              <LinearGradient
                colors={
                  isOvertime ? ['#f59e0b', '#f59e0b'] : ['#2FCA00', '#2FCA00']
                }
                style={styles.progressFill}
              />
            </Animated.View>
          </View>
        )}

        {isOvertime && (
          <Text style={styles.warningText}>
            Time limit exceeded. Overtime charges may apply.
          </Text>
        )}

        <View style={styles.row}>
          <Text style={styles.startText}>Start: {formattedStartTime}</Text>

          <Text style={styles.timeText}>
            Working Time: {formatTime(workingSeconds)}
          </Text>
        </View>

        {isOvertime && (
          <Text style={styles.warningText}>
            Overtime: {formatTime(overtimeSeconds)}
          </Text>
        )}

        <Text style={styles.billingText}>
          Billing calculated based on service duration
        </Text>

        {/* <View style={styles.amountRow}>
          <Text style={styles.amountText}>
            Current Amount: ₹{currentAmount}
          </Text>

          {isOvertime && otPricePerMinute > 0 && otAmount > 0 && (
            <Text style={styles.otAmount}>
              (+ ₹{parseFloat(otAmount).toFixed(2)} OT)
            </Text>
          )}
        </View> */}
      </View>
    </View>
  );
};

export default EndHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2baab1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  card: {},

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  progressBackground: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    overflow: 'hidden',
    marginVertical: 8,
  },

  progressFill: {
    height: 6,
    borderRadius: 60,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  startText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71B280',
  },

  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  billingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  otAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
    marginLeft: 8,
  },

  warningText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
});
