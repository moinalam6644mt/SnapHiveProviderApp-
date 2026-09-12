import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, Wallet, Info, Timer, Zap, User } from 'lucide-react-native';
import { theme } from '../../../styles/globalStyles';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const EndDetailes = ({ bookingDetails, providerDetails, isLoading }) => {

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ShimmerPlaceholder style={styles.skeletonTitle} />

          <View style={styles.content}>
            <View style={styles.row}>
              <ShimmerPlaceholder style={styles.skeletonIcon} />
              <ShimmerPlaceholder style={styles.skeletonTextLong} />
            </View>
            
            <View style={[styles.row, { alignItems: 'center' }]}>
              <ShimmerPlaceholder style={styles.skeletonIcon} />
              <ShimmerPlaceholder style={styles.skeletonTextShort} />
            </View>
            
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <ShimmerPlaceholder style={[styles.skeletonIcon, { marginTop: 2 }]} />
              <ShimmerPlaceholder style={styles.skeletonAddress} />
            </View>

            <View style={styles.dividerLight} />

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

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <ShimmerPlaceholder style={styles.skeletonIcon} />
            <ShimmerPlaceholder style={styles.skeletonFooterText} />
          </View>
        </View>
      </View>
    );
  }

  const formatDateTime = () => {
    if (!bookingDetails?.booking_date || !bookingDetails?.booking_time)
      return '';

    const dateTimeString = `${bookingDetails.booking_date}T${bookingDetails.booking_time}`;
    const bookingDate = new Date(dateTimeString);
    const today = new Date();

    const isToday =
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear();



    const datePart = isToday
      ? 'Today'
      : bookingDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

    const timePart = bookingDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${datePart}, ${timePart}`;
  };

  const fullAddress = [
    bookingDetails?.member_address_1,
    bookingDetails?.member_address_2,
    bookingDetails?.member_landmark,
  ]
    .filter(Boolean)
    .join(', ');

  const formatRate = value => {
    if (!value) return 0;
    const num = Number(value);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  const firstHourRate = formatRate(bookingDetails?.rate || 0);
  const nextHourRate = formatRate(bookingDetails?.next_hour_price || 0);
  const lateNightCharge = formatRate(bookingDetails?.late_night_price || 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Booking Details</Text>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Date */}
          <View style={styles.row}>
            <Clock size={18} color="#71B280" strokeWidth={1.8} />
            <Text style={styles.text}>{formatDateTime()}</Text>
          </View>

          {/* Customer Name */}
          <View style={[styles.row, { alignItems: 'center' }]}>
            <User size={18} color="#71B280" strokeWidth={1.8} />
            <Text style={[styles.text, { fontWeight: '700', fontSize: 15 }]}>
              {bookingDetails?.customer_name || 'Customer'}
            </Text>
          </View>

          {/* Address */}
          {fullAddress ? (
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <MapPin size={18} color="#71B280" strokeWidth={1.8} style={{ marginTop: 2 }} />
              <Text style={[styles.text, { flex: 1, lineHeight: 20, color: 'rgba(255,255,255,0.85)' }]}>
                {fullAddress}
              </Text>
            </View>
          ) : null}

          <View style={styles.dividerLight} />

          {/* First Hour Rate */}
          <View style={styles.row}>
            <Zap size={18} color="#f59e0b" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.text}>First Hour Rate</Text>
              <Text style={styles.rateText}>₹{firstHourRate}</Text>
            </View>
          </View>

          {/* Next Hour Rate */}
          {nextHourRate > 0 && (
            <View style={styles.row}>
              <Timer size={18} color="#f59e0b" strokeWidth={1.8} />
              <View style={styles.rateRow}>
                <Text style={styles.text}>Next Hour Rate</Text>
                <Text style={styles.rateText}>₹{nextHourRate}</Text>
              </View>
            </View>
          )}

          {lateNightCharge > 0 && (
            <View style={styles.row}>
              <Timer size={18} color="#f59e0b" strokeWidth={1.8} />
              <View style={styles.rateRow}>
                <Text style={styles.text}>Late Night Charge</Text>
                <Text style={[styles.rateText, { color: '#f59e0b' }]}>₹{lateNightCharge}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.dividerLight} />

        {/* Footer Info */}
        <View style={styles.footerRow}>
          <Info size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
          <Text style={styles.footerText}>
            Total Amount will be generated after service completion based on
            actual duration.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EndDetailes;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background || '#1f2937',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 0.25,
    borderColor: '#308695',
  },
  card: {
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  rateRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  pccContainer: {
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  pccText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
  skeletonTextLong: {
    height: 14,
    width: 150,
    borderRadius: 4,
  },
  skeletonTextShort: {
    height: 14,
    width: 100,
    borderRadius: 4,
  },
  skeletonAddress: {
    height: 32,
    flex: 1,
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
