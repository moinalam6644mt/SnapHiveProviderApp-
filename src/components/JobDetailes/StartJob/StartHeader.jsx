import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {MapPin, LocateFixed, AlertTriangle} from 'lucide-react-native';
import {Linking} from 'react-native';

import { theme } from '../../../styles/globalStyles';
export default function StartHeader({bookingDetails, providerDetails}) {
  const handleOpenDirection = () => {
    const lat = bookingDetails?.member_lat;
    const lng = bookingDetails?.member_lng;

    const address = [
      bookingDetails?.member_address_1,
      bookingDetails?.member_address_2,
      bookingDetails?.member_landmark,
    ]
      .filter(Boolean)
      .join(', ');

    let url = '';

    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (address) {
      const encodedAddress = encodeURIComponent(address);
      url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }

    if (url) {
      Linking.openURL(url);
    } else {
      console.warn('Location not available');
    }
  };

  const isLate = () => {
    if (!bookingDetails?.booking_date || !bookingDetails?.booking_time)
      return false;

    const dateTimeString = `${bookingDetails.booking_date}T${bookingDetails.booking_time}`;
    const bookingDate = new Date(dateTimeString);
    const today = new Date();

    return today > bookingDate;
  };

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

  const fullAddress = [
    bookingDetails?.member_address_1,
    bookingDetails?.member_address_2,
    bookingDetails?.member_landmark,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.secBody}>
      <View style={styles.section}>
        <View style={styles.headerTopRow}>
          <Text style={styles.dateText}>{formatDateTime()}</Text>
          {isLate() && (
            <View style={styles.lateWarningBox}>
              <AlertTriangle size={14} color="#b91c1c" />
              <Text style={styles.lateWarningText}>Running Late</Text>
            </View>
          )}
        </View>

        <View style={styles.userRow}>
          <Text style={styles.userName}>
            {bookingDetails?.customer_name || 'Customer'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.addressLine} numberOfLines={2}>
            {fullAddress}
          </Text>
        </View>

        {bookingDetails?.status !== '5' && (
          <View style={styles.contactRow}>
            <View style={styles.distanceWrapper}>
              <MapPin size={20} color="#4b5563" />
              <Text style={styles.distanceText}>
                {`${
                  bookingDetails?.distance || providerDetails?.distance || 0
                } km away`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.distanceWrapper}
              onPress={handleOpenDirection}>
              <LocateFixed size={15} color="#d20000ff" />
              <Text style={styles.directionText}>{`Get Directions`}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  secBody: {
    // width: "100%",
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginHorizontal: 20,
  },
  // section: { marginVertical: 10 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  lateWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.danger,
  },
  lateWarningText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'start',
    // position:"relative"
    // marginBottom: 10,
  },
  userName: {color: '#4b5563', fontSize: 15, fontWeight: '600'},
  dot: {
    // position:"absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4b5563',
    marginHorizontal: 8,
  },
  addressLine: {
    color: '#6b7280',
    fontSize: 14,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  distanceWrapper: {flexDirection: 'row', alignItems: 'center'},
  distanceText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#1E1E1E',
    fontSize: 16,
  },
  directionText: {
    marginLeft: 2,
    fontWeight: '700',
    color: '#d20000ff',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  actionIcons: {flexDirection: 'row', gap: 15},
  phoneCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStatusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4d7c0f',
    borderWidth: 2,
    borderColor: 'white',
  },
});
