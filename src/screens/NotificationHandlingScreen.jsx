import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { AuthUser } from '../../api/authUser';
import Toast from 'react-native-toast-message';

import StartHeader from '../components/JobDetailes/StartJob/StartHeader';
import StartDetailes from '../components/JobDetailes/StartJob/StartDetailes';
import BookingMap from '../components/BookingMap';
import { AuthContext } from '../context/AuthContext';
import { BookingContext } from '../context/BookingContext';

import { theme } from '../styles/globalStyles';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const NotificationHandlingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  // const orderId = 657;

  const { userId } = useContext(AuthContext);
  const { acceptBooking, rejectBooking } = useContext(BookingContext);

  const { callApi } = AuthUser();

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
          worker_id: userId,
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
      navigation.navigate('Main', { screen: 'HomeMain' });
    }
  };

  const handleAccept = async () => {
    console.log('Booking Accepted');
    await fetchBookingDetails(); // Refresh details to get updated status
    if (bookingDetails?.status === '2') {
      Toast.show({
        type: 'error',
        text1:
          'Sorry, this booking has already been accepted by another provider.',
      });
    } else {
      const response = await callApi({
        api: `/accept_job?worker_id=${userId}&booking_id=${orderId}`,
        method: 'POST',
        data: {},
      });

      console.log('Accept response: ', response);
    }
  };

  const handleReject = () => {
    console.log('Booking Rejected');
    rejectBooking(orderId);
    navigation.navigate('Main', { screen: 'HomeMain' });
    // API call korte parbe ekhane
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}>
      {loading ? (
        <View
          style={[styles.loaderWrapper, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={theme.background} />
            <Text style={styles.loadingText}>Loading...</Text>
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
                    address={`${bookingDetails?.member_address_1 || ''} ${bookingDetails?.member_address_2 || ''
                      } ${bookingDetails?.member_landmark || ''}`}
                    landmark={bookingDetails?.member_landmark}
                  />
                </View>
                {/* Buttons */}
                {bookingDetails?.status === '1' ? (
                  <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={async () => {
                        const result = await acceptBooking(
                          bookingDetails?.booking_id,
                          userId,
                        );

                        if (result?.success) {
                          navigation.push('JobDetailsScreen', {
                            orderId: bookingDetails?.booking_id,
                            userId,
                          });
                        }
                      }}>
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={handleReject}>
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : bookingDetails?.status === '2' ? (
                  <View style={styles.bookingTakenWrapper}>
                    <Text style={styles.bookingTakenText}>
                      This booking is already booked
                    </Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  mainContainer: { flex: 1, backgroundColor: theme.background },
  headerSection: {
    backgroundColor: theme.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#f3f4f6',
  },
  backButton: { marginRight: moderateScale(10), padding: moderateScale(4) },
  mainTitle: {
    flex: 1,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1e1b4b',
  },
  scrollView: { flex: 1 },
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
  buttonWrapper: {
    marginTop: verticalScale(10),
    width: '100%',
    // paddingHorizontal: horizontalScale(10),
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
  mapImage: { width: '100%', height: '100%' },
  loaderWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loaderCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(25),
    paddingHorizontal: horizontalScale(35),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: verticalScale(4) },
  },

  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1e1b4b',
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(10),
    gap: moderateScale(10),
  },

  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    backgroundColor: '#16A34A',
  },

  rejectButton: {
    backgroundColor: '#DC2626',
  },

  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },

  bookingTakenWrapper: {
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    alignItems: 'center',
  },

  bookingTakenText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default NotificationHandlingScreen;
