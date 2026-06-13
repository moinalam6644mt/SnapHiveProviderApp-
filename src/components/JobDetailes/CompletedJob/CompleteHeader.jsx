import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Clock, Wallet, Zap, Timer} from 'lucide-react-native';
import {calculateAmount} from '../../../services/calculateAmount';

import { theme } from '../../../styles/globalStyles';
const CompleteHeader = ({
  bookingDetails,
  providerDetails,
  elapsedSeconds,
  formatTime,
  calculation,
}) => {
  const isCompleted = bookingDetails?.status === '4';

  if (!calculation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payment Details</Text>
        <View style={[styles.card, {alignItems: 'center', padding: 20}]}>
          <Text style={{color: '#71717A'}}>Calculating billing details...</Text>
        </View>
      </View>
    );
  }

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

  const formatRate = value => {
    if (!value) return 0;
    const num = Number(value);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };
  // Function to convert decimal hours to HH:MM:SS
  const formatWorkingTime = decimalHours => {
    console.log(decimalHours);
    if (!decimalHours || isNaN(decimalHours)) return '00h 00m 00s';

    const totalSeconds = Math.floor(decimalHours * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Formatting: 02h 05m 10s format
    const hDisplay = hours > 0 ? `${hours}h ` : '00h ';
    const mDisplay = minutes > 0 ? `${minutes}m ` : '00m ';
    const sDisplay = seconds > 0 ? `${seconds}s` : '00s';

    return hDisplay + mDisplay + sDisplay;
  };

  // Rates extracted from details
  const firstHourRate = formatRate(bookingDetails?.rate || 0);
  const nextHourRate = formatRate(bookingDetails?.next_hour_price || 0);

  // Overtime rate handle
  const ot_rate = formatRate(calculation?.overtime_charge || 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Service {isCompleted ? 'Completed' : 'In Progress'}
          </Text>

          <Text
            style={[
              styles.status,
              isCompleted ? styles.completedText : styles.runningText,
            ]}>
            {isCompleted ? 'Finished' : 'Running'}
          </Text>
        </View>

        {/* Time Section */}
        <View style={styles.timeSection}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <Text style={styles.timeValue}>{formattedStartTime}</Text>
          </View>

          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Working Time</Text>
            <Text style={styles.timeValue}>
              {formatWorkingTime(calculation?.actual_hours)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Pricing Section */}
        <View style={styles.pricingContainer}>
          {/* First Hour Rate */}
          <View style={styles.row}>
            <View style={styles.left}>
              <Zap size={16} color="#6366F1" strokeWidth={2} />
              <Text style={styles.label}>First Hour Rate</Text>
            </View>
            <Text style={styles.value}>₹{firstHourRate}</Text>
          </View>

          {/* Next Hour Rate */}
          {parseFloat(nextHourRate) > 0 && (
            <View style={styles.row}>
              <View style={styles.left}>
                <Wallet size={16} color="#6366F1" strokeWidth={2} />
                <Text style={styles.label}>Next Hour Rate</Text>
              </View>
              <Text style={styles.value}>₹{nextHourRate}</Text>
            </View>
          )}

          {/* Overtime Rate - Only show if exists */}
          {parseFloat(ot_rate) > 0 && (
            <View style={styles.row}>
              <View style={styles.left}>
                <Clock size={16} color={theme.warning} strokeWidth={2} />
                <Text style={styles.label}>Overtime Rate</Text>
              </View>
              <Text style={[styles.value, {color: theme.warning}]}>₹{ot_rate}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CompleteHeader;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: theme.background,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  runningText: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  completedText: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  pricingContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
  },
});
