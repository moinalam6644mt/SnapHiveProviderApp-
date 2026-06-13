import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Compass,
  User,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import OTPVerificationModal from '../OtpVerification/jobStartWithOtp';
import handleChat from '../../services/ChatServiceFunction';
import { Screen } from 'react-native-screens';
import { AuthUser } from '../../../api/authUser';
const JobCard = ({ acceptedBookingData, userId }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [callingData,setCallingData]=useState("");

const {callApi}=AuthUser();

const createMeeting=async()=>{

  const response= await callApi({
    method:"CUSTOM_POST",
    api:`/user/create_token_video?worker_id=${userId}`,
    data:{
      booking_id:booking_id,
    }
  });
  setCallingData(response?.data);
  return response?.data;
}


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

  let {
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
  } = acceptedBookingData;

  const fullAddress = [member_address_1, member_address_2, member_landmark]
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
       console.warn("Error parsing data:", e);
     }
     
     const roomId = parsedData?.roomId || "";

     navigation.navigate("CallScreen", {
       callingData: parsedData,
       booking_id: booking_id,
       userId: userId,
     });
   }
  };

  const handleRedirect = () => {navigation.navigate('JobDetailsScreen', {
              orderId: booking_id,
              userId: userId,
              autoOpenOtp: true,
            })}


  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRedirect()}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{category_subchild_name}</Text>

        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => { handleChat(userId, booking_id, acceptedBookingData, navigation,member_name,logo,category_subchild_name); }}
            style={[styles.iconCircle, { backgroundColor: '#1e1b4b' }]}
            activeOpacity={0.8}
          >
            <MessageSquare size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCall()}
            style={[styles.iconCircle, { backgroundColor: '#f97316' }]}
            activeOpacity={0.8}
          >
            <Phone size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.iconBackgroundSmall}>
            <User size={14} color="#374151" />
          </View>
          <Text style={styles.userName}>{member_name || 'Member name'}</Text>
        </View>

        <Text style={styles.distance}>{formattedDistance} km from you</Text>
      </View>

      {/* Location & Distance */}
      <View style={styles.infoRow}>
        <View style={styles.rowLeft}>
          <MapPin size={16} color="#1e1b4b" style={styles.inlineIcon} />
          <Text style={styles.address}>{fullAddress}</Text>
        </View>

        <Text style={styles.price}>₹{rate}/h</Text>
      </View>

      {/* Time & Price */}
      <View style={styles.infoRow}>
        <View style={styles.rowLeft}>
          <Calendar size={16} color="#1e1b4b" style={styles.inlineIcon} />
          <Text style={styles.time}>{formatDateTime()}</Text>
        </View>
        <Text style={styles.duration}>Duration: {duration_hours} Hours</Text>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.targetIconContainer}>
          {/* <Compass size={24} color="#1e1b4b" /> */}
          <Image
            source={require('../../../assets/app/jobs/mage_location-fill.png')}
            // style={styles.centerLogo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('JobDetailsScreen', {
              orderId: booking_id,
              userId: userId,
              autoOpenOtp: true,
            })
          }
        >
          <Text style={styles.btnText}>Start Job</Text>
        </TouchableOpacity>
      </View>
      <OTPVerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </TouchableOpacity>
  );
};

export default JobCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  iconBackgroundSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontWeight: '600',
    color: '#374151',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  rowLeft: {
    flexDirection: 'row',
    flex: 0.7,
    alignItems: 'flex-start',
  },
  inlineIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  distance: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  time: {
    fontSize: 13,
    color: '#374151',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  duration: {
    textAlign: 'right',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 12,
  },
  targetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#0D9488',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
