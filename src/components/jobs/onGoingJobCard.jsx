import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import {User, MapPin, Calendar} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import handleChat from '../../services/ChatServiceFunction';
import {AuthUser} from '../../../api/authUser';

const OnGoingJobCard = ({onStartJob, ongoingBookingData, userId}) => {
  const [callingData, setCallingData] = useState('');
  const navigation = useNavigation();
  const {callApi} = AuthUser();

  if (!ongoingBookingData.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Ongoing Jobs Yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't started any jobs yet. Once you start a job, it will appear
          here.
        </Text>
      </View>
    );
  }
  return (
    <>
      {ongoingBookingData.map(item => {
        const {
          booking_date,
          booking_time,
          category_subchild_name,
          duration_hours,
          price_per_unit,
          distance,
          booking_id,
          name,
          member_address_1,
          member_address_2,
          member_landmark,
          member_mobile,
          member_name,
          logo,
        } = item;

        const createMeeting = async () => {
          const response = await callApi({
            method: 'CUSTOM_POST',
            api: `/user/create_token_video?worker_id=${userId}`,
            data: {
              booking_id: booking_id,
            },
          });
          setCallingData(response?.data);
          return response?.data;
        };

        const formatDateTime = () => {
          if (!booking_date || !booking_time) return '';

          // Combine date & time
          const dateTimeString = `${booking_date}T${booking_time}`;
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
          member_address_1,
          member_address_2,
          member_landmark,
        ]
          .filter(Boolean)
          .join(', ');

        const finalPhoneNumber =
          member_mobile && String(member_mobile).trim() !== ''
            ? String(member_mobile).trim()
            : '0000000000';

        const formatRate = value => {
          if (!value) return 0;

          const num = Number(value);

          return Number.isInteger(num) ? num : num.toFixed(2);
        };
        const formatDistance = value => {
          if (!value) return 0;

          const num = Number(value);

          return Number.isInteger(num) ? num : num.toFixed(2);
        };

        const rate = formatRate(price_per_unit);
        const formattedDistance = formatDistance(distance);

        return (
          <TouchableOpacity
            key={booking_id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('JobDetailsScreen', {
                orderId: booking_id,
                userId: userId,
              })
            }>
            <View style={styles.headerRow}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {category_subchild_name || 'Work_Type'}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Ongoing</Text>
              </View>
            </View>

            {/* Content Body */}
            <View style={styles.contentBody}>
              {/* Left Side */}
              <View style={styles.leftCol}>
                <View style={styles.infoRow}>
                  <User size={18} color="#64748b" />
                  <Text style={styles.userName}>
                    {member_name || 'Customer'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MapPin size={18} color="#64748b" />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {fullAddress || 'Address not provided'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar size={18} color="#64748b" />
                  <Text style={styles.dateTimeText}>{formatDateTime()}</Text>
                </View>
              </View>

              {/* Right Side */}
              <View style={styles.rightCol}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>First Hour Rate</Text>
                  <Text style={styles.priceText}>₹{rate}</Text>
                </View>
                <View style={styles.distanceWrapper}>
                  <MapPin size={12} color="#059669" />
                  <Text style={styles.distanceText}>
                    {formattedDistance} km away
                  </Text>
                </View>
                <Text style={styles.durationText}>
                  {duration_hours} Hrs Duration
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: '#dbeafe', // Light blue background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#2563eb', // Blue text
    fontSize: 12,
    fontWeight: '600',
  },
  iconGroup: {flexDirection: 'row', gap: 12},

  // Icon Buttons
  phoneIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E74',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftCol: {flex: 1.5, gap: 12},
  rightCol: {flex: 1, alignItems: 'flex-end', justifyContent: 'flex-start'},
  infoRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  userName: {fontSize: 14, fontWeight: '600', color: '#0f172a'},
  addressText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    flexShrink: 1,
    marginTop: -2,
  },
  dateTimeText: {fontSize: 13, color: '#475569', fontWeight: '500'},

  priceContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    width: '100%',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e1b4b',
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  distanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669', // Emerald green for positive reinforcement
  },
  durationText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },

  // Footer Row Alignment
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  locationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationImage: {
    width: 24,
    height: 24,
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#2E2E74',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E2E74',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  startBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

export default OnGoingJobCard;
