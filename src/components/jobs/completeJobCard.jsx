import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import { User, MapPin, Calendar, X, Download } from 'lucide-react-native';
import axios from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';
import { AuthUser } from '../../../api/authUser';

const CompleteJobCard = ({ completeBookingData, userId }) => {
  const {callApi} = AuthUser();
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [localPaymentStatus, setLocalPaymentStatus] = useState({});

  console.log("completeBookingData",completeBookingData);

  const fetchJobDetails = async (bookingId) => {
    try {
      setLoadingDetails(true);
      const url = `https://maidfort.com/app/booking_details?worker_id=${userId}&booking_id=${bookingId}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.status === 1) {
        setJobDetails(response.data.response.data);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch job details' });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong while fetching details.' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMarkAsPaid = async (bookingId) => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Missing worker id' });
      return;
    }

    try {
      setMarkingPaidId(bookingId);

      const response = await callApi({
        api: `/mark_as_paid?worker_id=${userId}`,
        method: 'CUSTOM_POST',
        data:{order_id:bookingId}
      });

      const status = response?.status ?? response?.response?.status;

      if (status === 1) {
        Toast.show({ type: 'success', text1: 'Marked as paid' });
        // Update local payment status so UI reflects the change immediately
        setLocalPaymentStatus(prev => ({
          ...prev,
          [bookingId]: 1,
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: 'Could not mark this job as paid.',
        });
      }
    } catch (error) {
      console.error('Mark as paid error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while marking as paid.',
      });
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleOpenModal = (bookingId) => {
    setSelectedJob(bookingId);
    setJobDetails(null); 
    setModalVisible(true);
    fetchJobDetails(bookingId);
  };

  const downloadInvoice = async () => {
    const invoiceUrl = jobDetails?.inv_det?.invoice_url;
    if (!invoiceUrl) {
      Toast.show({ type: 'info', text1: 'Unavailable', text2: 'Invoice link is not available.' });
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const sdkVersion = Platform.Version;
        if (sdkVersion < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to download the invoice.',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Cannot download without storage permission.' });
            return;
          }
        }
      }

      setDownloading(true);

      const fileName = `invoice_${Date.now()}.pdf`;
      const downloadPath = Platform.OS === 'android'
        ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`
        : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

      const res = await ReactNativeBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          description: 'Downloading Invoice...',
          mime: 'application/pdf',
          mediaScannable: true,
        },
        path: downloadPath,
      }).fetch('GET', invoiceUrl);

      console.log('Invoice downloaded to:', res.path());
      Toast.show({ type: 'success', text1: 'Downloaded!', text2: 'Invoice saved to your Downloads folder.' });
      setModalVisible(false);
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({ type: 'error', text1: 'Download Failed', text2: 'Something went wrong while downloading.' });
    } finally {
      setDownloading(false);
    }
  };

  const formatModalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    try {
      const dateTimeString = `${dateStr}T${timeStr}`;
      const d = new Date(dateTimeString);
      
      const datePart = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      const timePart = d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      
      return { date: datePart, time: timePart };
    } catch(e) {
      return { date: dateStr, time: timeStr };
    }
  };
  if (!completeBookingData.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Completed Jobs Yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't completed any jobs yet. Once you finish a job, it will
          appear here.
        </Text>
      </View>
    );
  }

  const selectedBooking =
    selectedJob != null
      ? completeBookingData.find(b => String(b.booking_id) === String(selectedJob))
      : null;

  const modalPaymentStatus =
    selectedBooking && selectedBooking.is_payment !== undefined
      ? (localPaymentStatus[selectedBooking.booking_id] ??
        (typeof selectedBooking.is_payment === 'string'
          ? Number(selectedBooking.is_payment)
          : selectedBooking.is_payment))
      : null;
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {completeBookingData.map(item => {
          let {
            booking_date,
            booking_time,
            category_subchild_name,
            duration_hours,
            total_amount,
            distance,
            booking_id,
            member_name,
            member_address_1,
            member_address_2,
            member_landmark,
            member_mobile,
            is_payment,
          } = item;

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

          const rate = formatRate(total_amount);
          const formattedDistance = formatDistance(distance);
          const effectivePaymentStatus =
            localPaymentStatus[booking_id] ??
            (typeof is_payment === 'string' ? Number(is_payment) : is_payment);

          return (
            <View key={booking_id} style={styles.container}>
              {/* Job Card */}
              <TouchableOpacity 
                style={styles.card} 
                onPress={() => handleOpenModal(booking_id)}
              >
                {/* Top Header Row */}
                <View style={styles.headerRow}>
                  <Text style={styles.jobTitle}>
                    {category_subchild_name || 'Job_Type'}
                  </Text>
                  <Text style={styles.jobId}>#{booking_id}</Text>
                </View>

                {/* Content Body */}
                <View style={styles.contentBody}>
                  {/* Left Side: Info */}
                  <View style={styles.leftCol}>
                    <View style={styles.infoRow}>
                      <User size={18} color="#71717a" />
                      <Text style={styles.userName}>{member_name || 'Member'}</Text>
                    </View>

                    <View
                      style={[styles.infoRow, { alignItems: 'flex-start' }]}
                    >
                      <MapPin size={18} color="#1e1b4b" />
                      <Text style={styles.addressText}>{fullAddress}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Calendar size={18} color="#71717a" />
                      <Text style={styles.dateTimeText}>
                        {formatDateTime()}
                      </Text>
                    </View>
                  </View>

                  {/* Right Side: Earnings */}
                  <View style={styles.rightCol}>
                    <Text style={styles.earningLabel}>Total Earning</Text>
                    <Text style={styles.priceText}>₹{rate}</Text>
                    <Text style={styles.durationText}>
                      Duration: {duration_hours} Hours
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Details Modal Component */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Job Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#1e1b4b" />
              </TouchableOpacity>
            </View>
            
            {loadingDetails ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2E2E74" />
                <Text style={styles.loadingText}>Fetching details...</Text>
              </View>
            ) : jobDetails ? (
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBody}
              >
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <User size={20} color="#4f46e5" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Customer Name</Text>
                      <Text style={styles.detailValue}>
                        {jobDetails['booking-det']?.customer_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: '#f0fdf4' }]}>
                      <MapPin size={20} color="#16a34a" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>
                        {jobDetails['booking-det']?.category_subchild_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: '#fff7ed' }]}>
                      <Calendar size={20} color="#ea580c" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {formatModalDateTime(
                          jobDetails['booking-det']?.booking_date,
                          jobDetails['booking-det']?.booking_time
                        ).date} at {formatModalDateTime(
                          jobDetails['booking-det']?.booking_date,
                          jobDetails['booking-det']?.booking_time
                        ).time}
                      </Text>
                    </View>
                  </View>
                </View>

                {jobDetails.inv_det?.invoice_url && (
                  <TouchableOpacity
                    style={[styles.downloadButton, downloading && { opacity: 0.7 }]}
                    onPress={downloadInvoice}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.downloadButtonText}>Downloading...</Text>
                      </>
                    ) : (
                      <>
                        <Download size={20} color="white" />
                        <Text style={styles.downloadButtonText}>Download Invoice</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Mark as Paid button inside modal, below invoice */}
                {modalPaymentStatus === 1 ? (
                  <View style={[styles.paymentButton, styles.paymentButtonDisabled, { marginTop: 12 }]}>
                    <Text style={styles.paymentButtonTextDisabled}>Marked as Paid</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.paymentButton, { marginTop: 12 }]}
                    onPress={() => handleMarkAsPaid(selectedJob)}
                    disabled={markingPaidId === selectedJob}
                  >
                    {markingPaidId === selectedJob ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.paymentButtonText}>Marking...</Text>
                      </>
                    ) : (
                      <Text style={styles.paymentButtonText}>Mark as Paid</Text>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
                <View style={styles.loaderContainer}>
                   <Text style={{color: '#64748b'}}>Details not available.</Text>
                </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    // Soft shadow logic
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#312e81',
  },
  jobId: {
    fontSize: 12,
    color: '#71717a',
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1.2,
    gap: 10,
  },
  rightCol: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46',
  },
  addressText: {
    fontSize: 12,
    color: '#52525b',
    lineHeight: 16,
  },
  dateTimeText: {
    fontSize: 13,
    color: '#52525b',
  },
  earningLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  priceText: {
    fontSize: 20, // Image anujayi ektu boro kora holo
    fontWeight: 'bold',
    color: '#18181b',
    marginVertical: 2,
  },
  durationText: {
    fontSize: 11,
    color: '#71717a',
  },
  // Floating Button Styling
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2E2E74',
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 250,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  modalBody: {
    paddingBottom: 10,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  detailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
    marginLeft: 52, // Align with text
  },
  downloadButton: {
    backgroundColor: '#2E2E74',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#2E2E74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButtonWrapper: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  paymentButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    // borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentButtonTextDisabled: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CompleteJobCard;
