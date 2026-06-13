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

const AcceptedJobCard = ({onStartJob, acceptedBookingData, userId}) => {
  const [callingData, setCallingData] = useState('');
  const navigation = useNavigation();
  const {callApi} = AuthUser();

  if (!acceptedBookingData.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Accepted Jobs Yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't accepted any jobs yet. Start browsing and accept a job to
          see it here.
        </Text>
      </View>
    );
  }
  return (
    <>
      {acceptedBookingData.map(item => {
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

        const handleCall = async () => {
          const data = await createMeeting();
          if (data) {
            let parsedData = data;
            try {
              // Only parse if it's a string
              if (typeof data === 'string') {
                parsedData = JSON.parse(data);
              }
            } catch (e) {
              console.warn('Error parsing data:', e);
            }

            const roomId = parsedData?.roomId || '';

            navigation.navigate('CallScreen', {
              callingData: parsedData,
              booking_id: booking_id,
              userId: userId,
            });
          }
        };

        return (
          <View key={booking_id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.jobTitle}>
                {category_subchild_name || 'Work_Type'}
              </Text>
              <View style={styles.iconGroup}>
                {/* Chat Icon - Custom PNG */}
                <TouchableOpacity
                  style={styles.chatIconBtn}
                  onPress={() => {
                    handleChat(
                      userId,
                      booking_id,
                      item,
                      navigation,
                      member_name,
                      logo,
                      category_subchild_name,
                    );
                  }}>
                  <Image
                    source={require('../../../assets/app/jobs/messages-2.png')}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                  {/* <View style={styles.onlineDot} /> */}
                </TouchableOpacity>

                {/* Call Icon - Custom PNG */}
                <TouchableOpacity
                  style={styles.phoneIconBtn}
                  onPress={() => handleCall()}>
                  <Image
                    source={require('../../../assets/app/jobs/material-symbols_call.png')}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Body */}
            <View style={styles.contentBody}>
              {/* Left Side */}
              <View style={styles.leftCol}>
                <View style={styles.infoRow}>
                  <User size={18} color="#71717a" />
                  <Text style={styles.userName}>
                    {member_name || 'Customer'}
                  </Text>
                </View>
                <View style={[styles.infoRow, {alignItems: 'flex-start'}]}>
                  <MapPin size={18} color="#1e1b4b" />
                  <Text style={styles.addressText}>{fullAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar size={18} color="#71717a" />
                  <Text style={styles.dateTimeText}>{formatDateTime()}</Text>
                </View>
              </View>

              {/* Right Side */}
              <View style={styles.rightCol}>
                <Text style={styles.distanceText}>
                  {formattedDistance} km from you
                </Text>
                <Text style={styles.priceText}>₹{rate}/h</Text>
                <Text style={styles.durationText}>
                  Duration: {duration_hours} Hours
                </Text>
              </View>
            </View>

            {/* Footer Button Section */}
            <View style={styles.footerRow}>
              {/* Teal Start Job Button */}
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() =>
                  navigation.navigate('JobDetailsScreen', {
                    orderId: booking_id,
                    userId: userId,
                  })
                }>
                <Text style={styles.startBtnText}>Start Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  jobTitle: {fontSize: 15, fontWeight: 'bold', color: '#312e81'},
  iconGroup: {flexDirection: 'row', gap: 12},

  // Icon Buttons
  phoneIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316', // Orange for Call
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E2E74', // Dark Blue for Chat
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    // tintColor: "white", // Ensure icons are white if they are flat
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftCol: {flex: 1.2, gap: 10},
  rightCol: {flex: 0.8, alignItems: 'flex-end', justifyContent: 'center'},
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  userName: {fontSize: 13, fontWeight: '600', color: '#3f3f46'},
  addressText: {fontSize: 12, color: '#52525b', lineHeight: 16},
  dateTimeText: {fontSize: 13, color: '#52525b'},
  distanceText: {fontSize: 13, fontWeight: '600', color: '#3f3f46'},
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
    marginVertical: 4,
  },
  durationText: {fontSize: 11, color: '#71717a'},

  // Footer Row Alignment
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6', // Light grey background for location circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationImage: {
    width: 24,
    height: 24,
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#008B8B', // Exact Teal color from image
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AcceptedJobCard;
