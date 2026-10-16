import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ImagePicker from 'react-native-image-crop-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { AuthUser } from '../../../api/authUser';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const DOC_TYPES = [
  {
    key: 'aadhaar_front',
    title: 'Aadhaar Card (Front)',
    subtitle: 'Upload clear front side with photo and name',
    icon: 'id-card-outline',
    allowGallery: true,
  },
  {
    key: 'aadhaar_back',
    title: 'Aadhaar Card (Back)',
    subtitle: 'Upload clear back side with address and QR code',
    icon: 'id-card-outline',
    allowGallery: true,
  },
  {
    key: 'pan_front',
    title: 'PAN Card (Front)',
    subtitle: 'Upload clear front side showing PAN number',
    icon: 'card-outline',
    allowGallery: true,
  },
  {
    key: 'pan_back',
    title: 'PAN Card (Back)',
    subtitle: 'Upload back side of your PAN card',
    icon: 'card-outline',
    allowGallery: true,
  },
  {
    key: 'live_photo',
    title: 'Live Camera Selfie',
    subtitle: 'Take a clear, well-lit live selfie using your front camera',
    icon: 'camera-outline',
    allowGallery: false, // Live capture only for fraud prevention
    isLive: true,
  },
];

export default function KycVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { callApi } = AuthUser();
  const { login } = useContext(AuthContext);

  const { userData } = route.params || {};
  let parsedUser = {};
  try {
    parsedUser = typeof userData === 'string' ? JSON.parse(userData) : (userData || {});
  } catch (e) {
    parsedUser = {};
  }

  const workerId = parsedUser?.worker_id || parsedUser?.id;

  const [documents, setDocuments] = useState({
    aadhaar_front: null,
    aadhaar_back: null,
    pan_front: null,
    pan_back: null,
    live_photo: null,
  });

  const [activeDocKey, setActiveDocKey] = useState(null);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result !== RESULTS.GRANTED) {
          Toast.show({ type: 'error', text1: 'Camera permission is required' });
          return false;
        }
      } catch (err) {
        console.warn('Camera permission check error:', err);
        return false;
      }
    }
    return true;
  };

  const handleCaptureCamera = async (isFrontCamera = false) => {
    setShowPickerModal(false);
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) return;

    try {
      const image = await ImagePicker.openCamera({
        width: 1000,
        height: 1000,
        cropping: false,
        includeBase64: true,
        useFrontCamera: isFrontCamera,
        compressImageQuality: 0.75,
        mediaType: 'photo',
      });

      if (image && image.data && activeDocKey) {
        const base64Data = `data:${image.mime || 'image/jpeg'};base64,${image.data}`;
        setDocuments((prev) => ({
          ...prev,
          [activeDocKey]: {
            uri: image.path,
            base64: base64Data,
            mime: image.mime || 'image/jpeg',
          },
        }));
        Toast.show({ type: 'success', text1: 'Image captured successfully' });
      }
    } catch (error) {
      if (
        error.message !== 'User cancelled image selection' &&
        error.message !== 'User did not grant camera permission.'
      ) {
        console.warn('Camera error:', error);
      }
    }
  };

  const handlePickGallery = async () => {
    setShowPickerModal(false);
    try {
      const image = await ImagePicker.openPicker({
        width: 1000,
        height: 1000,
        cropping: false,
        includeBase64: true,
        compressImageQuality: 0.75,
        mediaType: 'photo',
      });

      if (image && image.data && activeDocKey) {
        const base64Data = `data:${image.mime || 'image/jpeg'};base64,${image.data}`;
        setDocuments((prev) => ({
          ...prev,
          [activeDocKey]: {
            uri: image.path,
            base64: base64Data,
            mime: image.mime || 'image/jpeg',
          },
        }));
        Toast.show({ type: 'success', text1: 'Image selected from gallery' });
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.warn('Picker error:', error);
      }
    }
  };

  const openPickerFor = (doc) => {
    setActiveDocKey(doc.key);
    if (doc.isLive) {
      // Live selfie goes straight to camera
      handleCaptureCamera(true);
    } else {
      setShowPickerModal(true);
    }
  };

  const removeDoc = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  };

  const completedCount = Object.values(documents).filter(Boolean).length;
  const isAllComplete = completedCount === 5;

  const handleSubmitStep3 = async () => {
    if (!workerId) {
      Toast.show({
        type: 'error',
        text1: 'Worker ID is missing. Please restart registration.',
      });
      return;
    }

    if (!documents.aadhaar_front) {
      Toast.show({ type: 'error', text1: 'Please upload Aadhaar Card Front' });
      return;
    }
    if (!documents.aadhaar_back) {
      Toast.show({ type: 'error', text1: 'Please upload Aadhaar Card Back' });
      return;
    }
    if (!documents.pan_front) {
      Toast.show({ type: 'error', text1: 'Please upload PAN Card Front' });
      return;
    }
    if (!documents.pan_back) {
      Toast.show({ type: 'error', text1: 'Please upload PAN Card Back' });
      return;
    }
    if (!documents.live_photo) {
      Toast.show({ type: 'error', text1: 'Please take a Live Camera Selfie' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        step: '3',
        worker_id: String(workerId),
        aadhaar_front: documents.aadhaar_front.base64,
        aadhaar_back: documents.aadhaar_back.base64,
        pan_front: documents.pan_front.base64,
        pan_back: documents.pan_back.base64,
        live_photo: documents.live_photo.base64,
      };

      const response = await callApi({
        api: '/signupPro',
        method: 'CUSTOM_POST',
        data: payload,
      });

      const resData = response?.response;

      if (response?.status === 1 || resData?.status === 'OK') {
        Toast.show({
          type: 'success',
          text1: 'Application submitted! Waiting for admin approval.',
        });

        setTimeout(() => {
          // Provider must remain on the wait screen until admin approves in the admin panel
          navigation.replace('Verification', {
            finalData: JSON.stringify({
              worker_id: workerId,
              name: resData?.name || parsedUser?.name,
            }),
          });
        }, 1200);
      } else {
        const errMsg =
          resData?.errors?.[0]?.message ||
          resData?.message ||
          response?.message ||
          'Failed to upload documents';
        Toast.show({
          type: 'error',
          text1: errMsg,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong during KYC upload',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 3 of 3</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>KYC Verification</Text>
        <Text style={styles.subtitle}>
          Upload government-issued IDs and take a live selfie to verify your provider profile.
        </Text>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Documents Uploaded</Text>
            <Text style={styles.progressCount}>{completedCount}/5</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedCount / 5) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* List of Documents */}
        {DOC_TYPES.map((doc) => {
          const uploaded = documents[doc.key];
          return (
            <View
              key={doc.key}
              style={[
                styles.docCard,
                uploaded && styles.docCardUploaded,
                doc.isLive && styles.docCardLive,
              ]}
            >
              <View style={styles.docCardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    uploaded && styles.iconBoxUploaded,
                    doc.isLive && styles.iconBoxLive,
                  ]}
                >
                  <Icon
                    name={uploaded ? 'checkmark-circle' : doc.icon}
                    size={22}
                    color={uploaded ? '#10B981' : doc.isLive ? '#3B82F6' : '#1BA9A2'}
                  />
                </View>
                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    {doc.isLive && (
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>LIVE CAMERA</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                </View>
              </View>

              {/* Preview Thumbnail or Upload Button */}
              {uploaded ? (
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: uploaded.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewActions}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => openPickerFor(doc)}
                    >
                      <Icon name="refresh-outline" size={16} color="#1BA9A2" />
                      <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeDoc(doc.key)}
                    >
                      <Icon name="trash-outline" size={16} color="#EF4444" />
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadBtn, doc.isLive && styles.uploadBtnLive]}
                  onPress={() => openPickerFor(doc)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={doc.isLive ? 'camera' : 'cloud-upload-outline'}
                    size={18}
                    color={doc.isLive ? '#ffffff' : '#1BA9A2'}
                  />
                  <Text
                    style={[
                      styles.uploadBtnText,
                      doc.isLive && styles.uploadBtnTextLive,
                    ]}
                  >
                    {doc.isLive ? 'Take Live Selfie' : 'Upload Document'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Security Note */}
        <View style={styles.noteBox}>
          <Icon name="shield-checkmark-outline" size={20} color="#6B7280" />
          <Text style={styles.noteText}>
            Your documents are safely encrypted and strictly used for government KYC verification.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isAllComplete && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitStep3}
          disabled={!isAllComplete || submitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              isAllComplete
                ? ['#1BA9A2', '#0A736F']
                : ['#D1D5DB', '#9CA3AF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isAllComplete
                  ? 'Complete Registration'
                  : `Upload All (${completedCount}/5 Complete)`}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Picker Modal (Camera vs Gallery) */}
      <Modal visible={showPickerModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPickerModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Image Source</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleCaptureCamera(false)}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="camera-outline" size={22} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.modalOptionTitle}>Take Photo</Text>
                <Text style={styles.modalOptionSub}>Use camera to scan document</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handlePickGallery}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="image-outline" size={22} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.modalOptionSub}>Select existing image</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowPickerModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  stepBadge: {
    backgroundColor: '#E6F7F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepBadgeText: {
    color: '#1BA9A2',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1BA9A2',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1BA9A2',
    borderRadius: 4,
  },
  docCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  docCardUploaded: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  docCardLive: {
    borderColor: '#93C5FD',
  },
  docCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxUploaded: {
    backgroundColor: '#D1FAE5',
  },
  iconBoxLive: {
    backgroundColor: '#DBEAFE',
  },
  docInfo: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  liveBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  docSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F7F6',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1BA9A2',
    gap: 8,
  },
  uploadBtnLive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1BA9A2',
  },
  uploadBtnTextLive: {
    color: '#ffffff',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E6F7F6',
    gap: 4,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1BA9A2',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1BA9A2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalOptionSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
