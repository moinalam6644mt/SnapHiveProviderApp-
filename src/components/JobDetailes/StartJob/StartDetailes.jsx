import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Zap, Timer, Clock, AlertCircle, Info } from 'lucide-react-native';
import { theme } from '../../../styles/globalStyles';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const StartDetails = ({ bookingDetails, providerDetails, isLoading }) => {

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

  // Calculate Estimated Earnings logic
  // 1st hour rate + (baki hours * next hour rate) + cancel charge
  const remainingHours = Math.max(0, durationHours - 1);
  const estimatedEarnings =
    firstHourRate + remainingHours * nextHourRate + previousCancelCharge;

  if (isLoading) {
    return (
      <View style={styles.detailsBox}>
        <ShimmerPlaceholder style={styles.skeletonTitle} />

        <View style={styles.content}>
          <View style={styles.row}>
            <ShimmerPlaceholder style={styles.skeletonIcon} />
            <View style={styles.rateRow}>
              <ShimmerPlaceholder style={styles.skeletonTextShort} />
              <ShimmerPlaceholder style={styles.skeletonPrice} />
            </View>
          </View>

          <View style={styles.row}>
            <ShimmerPlaceholder style={styles.skeletonIcon} />
            <View style={styles.rateRow}>
              <ShimmerPlaceholder style={styles.skeletonTextShort} />
              <ShimmerPlaceholder style={styles.skeletonPrice} />
            </View>
          </View>

          <View style={styles.row}>
            <ShimmerPlaceholder style={styles.skeletonIcon} />
            <View style={styles.rateRow}>
              <ShimmerPlaceholder style={styles.skeletonTextShort} />
              <ShimmerPlaceholder style={styles.skeletonPrice} />
            </View>
          </View>
        </View>

        <View style={styles.dividerLight} />

        <View style={styles.footerRow}>
          <ShimmerPlaceholder style={styles.skeletonIcon} />
          <ShimmerPlaceholder style={styles.skeletonFooterText} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.sectionLabel}>Job Details</Text>

      <View style={styles.content}>
        {/* First Hour Rate */}
        <View style={styles.row}>
          <Zap size={18} color="#71B280" strokeWidth={1.8} />
          <View style={styles.rateRow}>
            <Text style={styles.label}>First Hour Rate</Text>
            <Text style={styles.value}>₹{formatRate(firstHourRate)}</Text>
          </View>
        </View>

        {/* Next Hour Rate */}
        {nextHourRate > 0 && (
          <View style={styles.row}>
            <Timer size={18} color="#71B280" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.label}>Next Hour Rate</Text>
              <Text style={styles.value}>₹{formatRate(nextHourRate)}</Text>
            </View>
          </View>
        )}

        {/* Late Night Charge */}
        {lateNightCharge > 0 && (
          <View style={styles.row}>
            <Timer size={18} color="#71B280" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.label}>Late Night Charge</Text>
              <Text style={[styles.value, { color: '#F87171' }]}>
                ₹{formatRate(lateNightCharge)}
              </Text>
            </View>
          </View>
        )}

        {/* Duration */}
        <View style={styles.row}>
          <Clock size={18} color="#71B280" strokeWidth={1.8} />
          <View style={styles.rateRow}>
            <Text style={styles.label}>Booked Duration</Text>
            <Text style={styles.value}>
              {`${durationHours} hour${durationHours > 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Cancellation Charge (Conditional) */}
        {previousCancelCharge > 0 && (
          <View style={styles.row}>
            <AlertCircle size={18} color="#F87171" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.label}>Previous Cancel Charge</Text>
              <Text style={[styles.value, { color: '#F87171' }]}>
                ₹{formatRate(previousCancelCharge)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.dividerLight} />

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Info size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.8} />
        <Text style={styles.note}>
          Final amount depends on actual working hours.
        </Text>
      </View>
    </View>
  );
};

export default StartDetails;

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: theme.background || '#1f2937', // Solid single color background
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 0.25,
    borderColor: '#308695',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  content: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  value: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  note: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  // Skeleton Styles
  skeletonTitle: {
    height: 18,
    width: 120,
    borderRadius: 4,
    marginBottom: 14,
  },
  skeletonIcon: {
    height: 18,
    width: 18,
    borderRadius: 9,
  },
  skeletonTextShort: {
    height: 14,
    width: 100,
    borderRadius: 4,
  },
  skeletonPrice: {
    height: 14,
    width: 40,
    borderRadius: 4,
  },
  skeletonFooterText: {
    height: 28,
    flex: 1,
    borderRadius: 4,
  },
});
