import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../styles/globalStyles';
const StartDetails = ({ bookingDetails, providerDetails }) => {
  console.log('Booking Details:', bookingDetails);
  console.log('Provider Details:', providerDetails);
  // Helper to format price
  const formatRate = value => {
    if (!value) return 0;
    const num = Number(value);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  // Extract values
  const firstHourRate = Number(bookingDetails?.rate || 0);
  const nextHourRate = Number(bookingDetails?.next_hour_price || 0);
  const lateNightCharge = Number(bookingDetails?.late_night_price || 0);
  const durationHours = Number(bookingDetails?.duration_hours || 0);
  const previousCancelCharge = Number(
    providerDetails?.previous_cancel_charge
      ? providerDetails.previous_cancel_charge
      : 0,
  );
  const lateNightCharege = Number(bookingDetails?.late_night_price || 0);

  // Calculate Estimated Earnings logic
  // 1st hour rate + (baki hours * next hour rate) + cancel charge
  const remainingHours = Math.max(0, durationHours - 1);
  const estimatedEarnings =
    firstHourRate + remainingHours * nextHourRate + previousCancelCharge;

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.sectionLabel}>Job Details</Text>

      {/* First Hour Rate */}
      <View style={styles.detailItem}>
        <Text style={styles.label}>First Hour Rate</Text>
        <Text style={styles.value}>₹{formatRate(firstHourRate)}</Text>
      </View>

      {/* Next Hour Rate */}
      {nextHourRate > 0 && (
        <View style={styles.detailItem}>
          <Text style={styles.label}>Next Hour Rate</Text>
          <Text style={styles.value}>₹{formatRate(nextHourRate)}</Text>
        </View>
      )}

      {/* Late Night Charge */}
      {lateNightCharege > 0 && (
        <View style={styles.detailItem}>
          <Text style={styles.label}>Late Night Charge</Text>
          <Text style={[styles.value, { color: theme.warning }]}>
            ₹{formatRate(lateNightCharege)}
          </Text>
        </View>
      )}

      {/* Duration */}
      <View style={styles.detailItem}>
        <Text style={styles.label}>Booked Duration</Text>
        <Text style={styles.value}>
          {`${durationHours} hour${durationHours > 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Cancellation Charge (Conditional) */}
      {previousCancelCharge > 0 && (
        <View style={styles.detailItem}>
          <Text style={styles.label}>Previous Cancel Charge</Text>
          <Text style={[styles.value, { color: theme.warning }]}>
            ₹{formatRate(previousCancelCharge)}
          </Text>
        </View>
      )}
      {/* Late Night Charge (Conditional) */}

      <View style={styles.divider} />

      {/* Total Estimated Earnings */}
      {/* <View style={styles.detailItem}>
        <Text style={styles.estimatedLabel}>Estimated Total</Text>
        <Text style={styles.estimatedValue}>
          ₹{formatRate(estimatedEarnings)}
        </Text>
      </View> */}

      <Text style={styles.note}>
        *Final amount depends on actual working hours.
      </Text>
    </View>
  );
};

export default StartDetails;

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFFFFF',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  estimatedLabel: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
  },
  estimatedValue: {
    fontWeight: '900',
    color: '#FFFFFF',
    fontSize: 18,
  },
  note: {
    fontSize: 11,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
});
