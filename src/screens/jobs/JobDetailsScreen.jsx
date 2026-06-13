import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import OTPVerificationModal from '../../components/OtpVerification/jobStartWithOtp';
import { AuthUser } from '../../../api/authUser';
import { useOtpShared } from '../../context/OtpSharedContext';
import Toast from 'react-native-toast-message';
import handleChat from '../../services/ChatServiceFunction';
import LinearGradient from 'react-native-linear-gradient';

import StartHeader from '../../components/JobDetailes/StartJob/StartHeader';
import StartDetailes from '../../components/JobDetailes/StartJob/StartDetailes';
import StartButtton from '../../components/JobDetailes/StartJob/StartButton';
import Warning from '../../components/JobDetailes/StartJob/Warning';

import EndHeader from '../../components/JobDetailes/EndJob/EndHeader';
import UserProfile from '../../components/JobDetailes/EndJob/UserProfile';
import EndDetailes from '../../components/JobDetailes/EndJob/EndDetailes';
import EndButton from '../../components/JobDetailes/EndJob/EndButton';

import CompleteDetailes from '../../components/JobDetailes/CompletedJob/CompleteDetailes';
import CompleteHeader from '../../components/JobDetailes/CompletedJob/CompleteHeader';

import InvoiceButton from '../../components/JobDetailes/InvoiceButton';
import MarkPaid from '../../components/JobDetailes/MarkPaid';
import BookingMap from '../../components/BookingMap';

import ICard from '../../components/JobDetailes/EndJob/ICard';

import { theme } from '../../styles/globalStyles';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const formatTime = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}h ${m}m ${s}s`;
};

const JobDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, userId, autoOpenOtp } = route.params;
  const [showIdCard, setShowIdCard] = useState(false);

  const { callApi } = AuthUser();

  const {
    bookingDetails,
    setBookingDetails,
    resetTrigger,
    setResetTrigger,
    onVerify,
    setOnVerify,
  } = useOtpShared();

  const [modalVisible, setModalVisible] = useState(false);
  // const [bookingDetails, setBookingDetails] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPayment, setIsPayment] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [calculation, setCalculation] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    if (!providerDetails?.start_time) return;

    const startDate = new Date(providerDetails.start_time.replace(' ', 'T'));

    const durationSeconds =
      parseFloat(bookingDetails?.duration_hours || 0) * 3600;

    if (bookingDetails?.status === '4') {
      if (providerDetails?.end_time) {
        const endDate = new Date(providerDetails.end_time.replace(' ', 'T'));

        const diff = Math.max(0, Math.floor((endDate - startDate) / 1000));
        setElapsedSeconds(diff);
      }

      return;
    }

    const interval = setInterval(() => {
      const now = new Date();

      const diff = Math.max(0, Math.floor((now - startDate) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [providerDetails, bookingDetails]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    // Reset timer states so previous job's time doesn't bleed into the new job's loading screen
    setElapsedSeconds(0);
    if (!orderId) return;

    try {
      const response = await callApi({
        method: 'GET',
        api: '/booking_details',
        data: {
          member_id: userId,
          booking_id: orderId,
        },
      });

      console.log('response: ', response?.response?.data);

      if (response?.status === 1) {
        const bookingData = response?.response?.data?.['booking-det'];
        const providerData = response?.response?.data?.['provider-det'];

        setBookingDetails(bookingData);
        setProviderDetails(providerData);
        setCalculation(response?.response?.data?.calculation);

        if (response?.response?.data?.inv_det?.invoice_url) {
          setInvoiceDetails(response.response.data.inv_det);
        }

        if (bookingData?.status === '3' && providerData?.start_time) {
          setStoredStartTime(providerData.start_time);
        }
        setIsPayment(bookingData?.is_payment);
      }
    } catch (error) {
      console.warn('Fetch booking error:', error);
    } finally {
      setLoading(false); // STOP LOADER
    }
  };

  useEffect(() => {
    if (autoOpenOtp) {
      setModalVisible(true);

      navigation.setParams({ autoOpenOtp: false });
    }
  }, [autoOpenOtp]);

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

  const handleCallCustomer = async () => {
    if (!orderId) return;
    try {
      const response = await callApi({
        method: 'CUSTOM_POST',
        api: `/user/create_token_video?worker_id=${userId}`,
        data: { booking_id: orderId },
      });
      const data = response?.data;
      if (!data) {
        Toast.show({
          type: 'error',
          text1: 'Could not start call',
          text2: response?.message || 'Please try again.',
        });
        return;
      }
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch {}
      }
      navigation.navigate('CallScreen', {
        callingData: parsedData,
        booking_id: orderId,
        userId,
      });
    } catch (e) {
      console.warn('Call customer error:', e);
      Toast.show({
        type: 'error',
        text1: 'Call failed',
        text2: 'Please check your connection and try again.',
      });
    }
  };

  const handleMessageCustomer = () => {
    if (!orderId || !bookingDetails) return;
    handleChat(
      userId,
      orderId,
      bookingDetails,
      navigation,
      bookingDetails?.member_name,
      bookingDetails?.logo,
      bookingDetails?.category_subchild_name,
    );
  };

  const startVerifyWithOtp = async otp => {
    try {
      setLoading(true);
      const response = await callApi({
        method: 'CUSTOM_POST',
        api: `/verify_start_otp?worker_id=${userId}`,
        data: {
          otp: String(otp),
          order_id: String(orderId),
        },
      });

      if (response?.status === 1) {
        await fetchBookingDetails();
        handleOtpSuccess('Start your job');
      } else {
        handleOtpFailure();
      }
    } catch (error) {
      console.warn('Start OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const endVerifyWithOtp = async otp => {
    try {
      setLoading(true);
      const response = await callApi({
        method: 'CUSTOM_POST',
        api: `/verify_end_otp?worker_id=${userId}`,
        data: {
          otp: String(otp),
          order_id: String(orderId),
        },
      });

      if (response?.status === 1) {
        await fetchBookingDetails();
        handleOtpSuccess('End your job');
      } else {
        handleOtpFailure();
      }
    } catch (error) {
      console.warn('End OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = message => {
    Toast.show({
      type: 'success',
      text1: 'OTP verified successfully',
      text2: message,
    });

    setOtpAttempts(0);
    setModalVisible(false);
    setResetTrigger(prev => prev + 1);
    setIsBlocked(false);
  };

  const handleOtpFailure = () => {
    setOtpAttempts(prev => {
      const newAttempts = prev + 1;

      if (newAttempts >= 3) {
        handleBlockRide();
        return 3;
      }

      Toast.show({
        type: 'error',
        text1: 'Wrong OTP',
        text2: `Attempts left: ${3 - newAttempts}`,
      });

      return newAttempts;
    });

    setModalVisible(false);
    setResetTrigger(prev => prev + 1);
  };

  const handleBlockRide = () => {
    setIsBlocked(true);

    Toast.show({
      type: 'error',
      text1: 'You are blocked for this ride',
    });

    navigation.navigate('Main', { screen: 'HomeMain' });
  };

  const verifyOtp = code => {
    if (!bookingDetails) return;

    if (code === bookingDetails?.start_otp) {
      startVerifyWithOtp(code);
    } else if (code === bookingDetails?.end_otp) {
      endVerifyWithOtp(code);
    } else {
      handleOtpFailure();
    }
  };

  const handleCancelJob = () => {
    setCancelModalVisible(true);
  };

  const confirmCancelJob = async () => {
    setCancelModalVisible(false);
    try {
      setLoading(true);
      const response = await callApi({
        method: 'GET',
        api: `/provider_cancel_booking?worker_id=${userId}&booking_id=${orderId}`,
      });

      if (response?.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Job Cancelled',
          text2: Number(bookingDetails?.provider_cancel_charge || 0) > 0
            ? `Job cancelled. A charge of ₹${bookingDetails?.provider_cancel_charge} has been applied.`
            : 'You cancelled this job and cancellation charges will apply',
        });
        navigation.navigate('Main', { screen: 'HomeMain' });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Failed to cancel job',
        });
      }
    } catch (error) {
      console.warn('Cancel Job error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOnVerify(() => verifyOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDetails]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}>
      {loading ? (
        <View
          style={[styles.loaderWrapper, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={theme.background} />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        </View>
      ) : (
        <>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={true}
          />
          <LinearGradient
            colors={['#134E5E', '#71B280']}
            style={styles.gradientBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Fixed Header */}
            <View style={styles.headerSection}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ChevronLeft
                  size={moderateScale(28)}
                  color="#fff"
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              <Text style={styles.mainTitle} numberOfLines={1}>
                {bookingDetails?.category_subchild_name || 'Service'}
              </Text>
              {(bookingDetails?.status === '2' ||
                bookingDetails?.status === '3') && (
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.headerIconWrapper}
                    activeOpacity={0.8}
                    onPress={handleMessageCustomer}>
                    <LinearGradient
                      colors={['#134E5E', '#71B280']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.headerIconGradient}
                    >
                      <Image
                        source={require('../../../assets/app/jobs/messages-2.png')}
                        style={styles.headerActionIcon}
                        resizeMode="contain"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerIconWrapper}
                    activeOpacity={0.8}
                    onPress={handleCallCustomer}>
                    <LinearGradient
                      colors={['#134E5E', '#71B280']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.headerIconGradient}
                    >
                      <Image
                        source={require('../../../assets/app/jobs/material-symbols_call.png')}
                        style={styles.headerActionIcon}
                        resizeMode="contain"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Scrollable Content inside Bottom Sheet */}
            <View style={styles.bottomSheet}>
              <ScrollView
                style={styles.scrollView}
              contentContainerStyle={styles.contentBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}>
              <View style={styles.innerContent}>
                {/* STATUS 2 = ACCEPTED */}
                {bookingDetails?.status === '2' && (
                  <View style={styles.statusWrapper}>
                    <StartHeader
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                    />
                    <StartDetailes
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                    />
                    <Warning instructions={bookingDetails?.instructions} />
                  </View>
                )}

                {/* STATUS 3 = IN PROGRESS */}
                {bookingDetails?.status === '3' && (
                  <View style={styles.statusWrapper}>
                    <EndHeader
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                      elapsedSeconds={elapsedSeconds}
                      formatTime={formatTime}
                    />
                    {/* <UserProfile
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                      onOpenIdCard={() => setShowIdCard(true)}
                    /> */}
                    <EndDetailes
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                      elapsedSeconds={elapsedSeconds}
                      formatTime={formatTime}
                    />
                  </View>
                )}

                {/* STATUS 4 = COMPLETED */}
                {bookingDetails?.status === '4' && (
                  <View style={styles.statusWrapper}>
                    <CompleteHeader
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                      elapsedSeconds={elapsedSeconds}
                      formatTime={formatTime}
                      calculation={calculation}
                    />
                    {/* <UserProfile
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                    /> */}
                    <CompleteDetailes
                      bookingDetails={bookingDetails}
                      providerDetails={providerDetails}
                      elapsedSeconds={elapsedSeconds}
                      formatTime={formatTime}
                      calculation={calculation}
                    />
                  </View>
                )}

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
                {bookingDetails?.status === '2' && (
                  <View style={styles.buttonWrapper}>
                    <StartButtton
                      setModalVisible={setModalVisible}
                      isBlocked={isBlocked}
                      loading={loading}
                      onCancelPress={handleCancelJob}
                    />
                  </View>
                )}

                {bookingDetails?.status === '3' && (
                  <View style={styles.buttonWrapper}>
                    <EndButton
                      setModalVisible={setModalVisible}
                      isBlocked={isBlocked}
                    />
                  </View>
                )}

                {bookingDetails?.status === '4' && (
                  <View style={styles.statusWrapper}>
                    <InvoiceButton invoiceUrl={invoiceDetails?.invoice_url} />
                    <MarkPaid
                      isPayment={isPayment}
                      workerId={userId}
                      orderId={orderId}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </>
    )}

      <OTPVerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Custom Cancellation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setCancelModalVisible(false)}
          />
          <View style={styles.cancelModalCard}>
            <View style={styles.iconContainer}>
              <AlertCircle size={moderateScale(50)} color={theme.danger} />
            </View>
            <Text style={styles.cancelModalTitle}>Cancel Job</Text>
            <Text style={styles.cancelModalMessage}>
              Are you sure you want to cancel?{'\n'}
              {Number(providerDetails?.provider_cancel_charge || 0) > 0 ? (
                <Text style={{ fontWeight: '700', color: theme.danger }}>
                  ₹{providerDetails?.provider_cancel_charge} cancellation fee will apply.
                </Text>
              ) : (
                'Cancellation charges will apply.'
              )}
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSecondaryBtn]}
                onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.modalSecondaryBtnText}>No, Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalPrimaryBtn]}
                onPress={confirmCancelJob}>
                <Text style={styles.modalPrimaryBtnText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showIdCard}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdCard(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowIdCard(false)}>
          <Pressable onPress={() => { }}>
            <ICard
              bookingDetails={bookingDetails}
              providerDetails={providerDetails}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#134E5E' }, // Dark fallback
  gradientBg: { flex: 1 },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    flex: 1,
    paddingTop: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    marginTop: verticalScale(10),
    overflow: 'hidden',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
  },
  backButton: { marginRight: moderateScale(10), padding: moderateScale(4) },
  mainTitle: {
    flex: 1,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginLeft: moderateScale(8),
  },
  headerIconWrapper: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    overflow: 'hidden',
    shadowColor: '#134E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cancelModalCard: {
    width: '85%',
    backgroundColor: theme.background,
    borderRadius: moderateScale(24),
    padding: moderateScale(25),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  cancelModalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: verticalScale(10),
  },
  cancelModalMessage: {
    fontSize: moderateScale(15),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(24),
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: moderateScale(12),
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtn: {
    backgroundColor: theme.danger,
  },
  modalSecondaryBtn: {
    backgroundColor: '#F3F4F6',
  },
  modalPrimaryBtnText: {
    color: theme.background,
    fontSize: moderateScale(15),
    fontWeight: 'bold',
  },
  modalSecondaryBtnText: {
    color: '#4B5563',
    fontSize: moderateScale(15),
    fontWeight: 'bold',
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
});

export default JobDetailsScreen;
