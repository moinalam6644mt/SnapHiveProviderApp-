import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronLeft} from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {AuthUser} from '../../api/authUser';
import Toast from 'react-native-toast-message';

import StartHeader from '../components/JobDetailes/StartJob/StartHeader';
import StartDetailes from '../components/JobDetailes/StartJob/StartDetailes';
import BookingMap from '../components/BookingMap';
import {AuthContext} from '../context/AuthContext';

import { theme } from '../styles/globalStyles';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const formatDateTime = dateStr => {
  if (!dateStr) return 'N/A';
  // Sometimes date comes as "2024-04-05 10:30:00". React Native new Date() might fail on " ".
  const safeDateStr = dateStr.replace(' ', 'T');
  const date = new Date(safeDateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

const CancelledBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {orderId} = route.params;

  const {userId} = useContext(AuthContext);

  const {callApi} = AuthUser();

  const [bookingDetails, setBookingDetails] = useState({});
  const [providerDetails, setProviderDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBookingDetails = async () => {
    setLoading(true);
    if (!orderId) return;

    try {
      const response = await callApi({
        method: 'GET',
        api: '/booking_details',
        data: {
          worker_id: userId, // Assuming worker perspective
          booking_id: orderId,
        },
      });

      console.log('response: ', response?.response?.data);

      if (response?.status === 1) {
        const bookingData = response?.response?.data?.['booking-det'];
        const providerData = response?.response?.data?.['provider-det'];

        setBookingDetails(bookingData);
        setProviderDetails(providerData);
      }
    } catch (error) {
      console.warn('Fetch booking error:', error);
    } finally {
      setLoading(false); // STOP LOADER
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookingDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]),
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main', {screen: 'HomeMain'});
    }
  };

  const formattedCancellationTime = formatDateTime(bookingDetails?.updated_at);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}>
      {loading ? (
        <View
          style={[styles.loaderWrapper, {backgroundColor: 'rgba(0,0,0,0.4)'}]}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#ED6E0A" />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        </View>
      ) : (
        <>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={true}
          />
          <View style={styles.mainContainer}>
            {/* Fixed Header */}
            <View style={styles.headerSection}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ChevronLeft
                  size={moderateScale(28)}
                  color="#1e1b4b"
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              <Text style={styles.mainTitle} numberOfLines={1}>
                {bookingDetails?.category_name || 'Service'}
              </Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}>
              <View style={styles.innerContent}>
                <View style={styles.statusWrapper}>
                  <StartHeader
                    bookingDetails={bookingDetails}
                    providerDetails={providerDetails}
                  />
                  <StartDetailes
                    bookingDetails={bookingDetails}
                    providerDetails={providerDetails}
                  />
                </View>

                {/* Map */}
                <View style={styles.mapContainer}>
                  <BookingMap
                    lat={bookingDetails?.member_lat}
                    lng={bookingDetails?.member_lng}
                    address={`${bookingDetails?.member_address_1 || ''} ${
                      bookingDetails?.member_address_2 || ''
                    } ${bookingDetails?.member_landmark || ''}`}
                    landmark={bookingDetails?.member_landmark}
                  />
                </View>
                
                {/* Cancelled Banner */}
                <View style={styles.cancelledBannerWrapper}>
                  <Text style={styles.cancelledBannerTitle}>
                    Booking Cancelled
                  </Text>
                  <Text style={styles.cancelledBannerTime}>
                    Cancelled On: {formattedCancellationTime}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: theme.background},
  mainContainer: {flex: 1, backgroundColor: theme.background},
  headerSection: {
    backgroundColor: theme.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#f3f4f6',
  },
  backButton: {marginRight: moderateScale(10), padding: moderateScale(4)},
  mainTitle: {
    flex: 1,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1e1b4b',
  },
  scrollView: {flex: 1},
  contentBody: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  innerContent: {
    flexGrow: 1,
    gap: moderateScale(12),
    paddingTop: verticalScale(10),
  },
  statusWrapper: {
    gap: moderateScale(12),
    width: '100%',
  },
  mapContainer: {
    height: verticalScale(180),
    marginVertical: verticalScale(10),
    borderWidth: moderateScale(1),
    marginHorizontal: horizontalScale(20),
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  loaderWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderCard: {
    backgroundColor: theme.background,
    paddingVertical: verticalScale(25),
    paddingHorizontal: horizontalScale(35),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(10),
    shadowOffset: {width: 0, height: verticalScale(4)},
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1e1b4b',
  },
  cancelledBannerWrapper: {
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: '#FEE2E2', // Light red background
    borderRadius: moderateScale(10),
    marginHorizontal: horizontalScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  cancelledBannerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#DC2626', // Deep red
    marginBottom: verticalScale(5),
  },
  cancelledBannerTime: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#991B1B',
  },
});

export default CancelledBookingScreen;
