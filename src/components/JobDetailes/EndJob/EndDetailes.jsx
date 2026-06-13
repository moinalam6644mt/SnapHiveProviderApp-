import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, Wallet, Info, Timer, Zap, User } from 'lucide-react-native';

const EndDetailes = ({ bookingDetails, providerDetails }) => {
  console.log('Booking Details:', bookingDetails);
  console.log('Provider Details:', providerDetails);
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

  // Duto rate alada kora holo
  const firstHourRate = formatRate(bookingDetails?.rate || 0);
  const nextHourRate = formatRate(bookingDetails?.next_hour_price || 0);
  const lateNightCharge = formatRate(bookingDetails?.late_night_price || 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Date */}
        <View style={styles.row}>
          <Clock size={18} color="#52525B" strokeWidth={1.8} />
          <Text style={styles.text}>{formatDateTime()}</Text>
        </View>

        {/* Customer Name */}
        <View style={[styles.row, { alignItems: 'center' }]}>
          <User size={18} color="#52525B" strokeWidth={1.8} />
          <Text style={[styles.text, { fontWeight: '700', color: '#18181B', fontSize: 15 }]}>
            {bookingDetails?.customer_name || 'Customer'}
          </Text>
        </View>

        {/* Address */}
        {fullAddress ? (
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <MapPin size={18} color="#52525B" strokeWidth={1.8} style={{ marginTop: 2 }} />
            <Text style={[styles.text, { flex: 1, lineHeight: 20, color: '#52525B' }]}>
              {fullAddress}
            </Text>
          </View>
        ) : null}

        <View style={styles.dividerLight} />

        {/* First Hour Rate */}
        <View style={styles.row}>
          <Zap size={18} color="#312E81" strokeWidth={1.8} />
          <View style={styles.rateRow}>
            <Text style={styles.text}>First Hour Rate</Text>
            <Text style={styles.rateText}>₹{firstHourRate}</Text>
          </View>
        </View>

        {/* Next Hour Rate */}
        {nextHourRate > 0 && (
          <View style={styles.row}>
            <Timer size={18} color="#312E81" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.text}>Next Hour Rate</Text>
              <Text style={styles.rateText}>₹{nextHourRate}</Text>
            </View>
          </View>
        )}

        {lateNightCharge > 0 && (
          <View style={styles.row}>
            <Timer size={18} color="#312E81" strokeWidth={1.8} />
            <View style={styles.rateRow}>
              <Text style={styles.text}>Late Night Charge</Text>
              <Text style={styles.rateText}>₹{lateNightCharge}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Info size={18} color="#52525B" strokeWidth={1.8} />
        <Text style={styles.footerText}>
          Total Amount will be generated after service completion based on
          actual duration.
        </Text>
      </View>
    </View>
  );
};

export default EndDetailes;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#312E81',
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
  text: {
    fontSize: 14,
    color: '#52525B',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  rateRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312E81',
  },
  divider: {
    marginTop: 16,
    marginBottom: 12,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
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
});
