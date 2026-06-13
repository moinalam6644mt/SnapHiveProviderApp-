import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {IdCard, User} from 'lucide-react-native';

const UserProfile = ({bookingDetails, providerDetails, onOpenIdCard}) => {
  console.log('Booking Details in UserProfile:', bookingDetails);
  console.log('Provider Details in UserProfile:', providerDetails);

  const formatDateTime = () => {
    if (!bookingDetails?.booking_date || !bookingDetails?.booking_time)
      return '';

    // Combine date & time
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
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.avatarWrapper,
              {justifyContent: 'center', alignItems: 'center'},
            ]}>
            {bookingDetails?.logo && bookingDetails.logo !== '' ? (
              <Image
                source={{uri: bookingDetails.logo}}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <User size={24} color="#64748b" />
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.name}>
              {bookingDetails?.customer_name
                ? bookingDetails?.customer_name
                : 'Customer'}
            </Text>
            <Text style={styles.time}>{formatDateTime()}</Text>
          </View>
        </View>

        {/* Right Icon Button */}
        <TouchableOpacity style={styles.iconButton} onPress={onOpenIdCard}>
          <IdCard size={20} color="#1E1B4B" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#bdb9b9',
    paddingHorizontal: 30,
    // marginHorizontal: 20,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultAvatar: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#65A30D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#312E81',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '400',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F3F3F3',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 17.5,
    elevation: 3,
  },
});
