import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ImagePicker from 'react-native-image-crop-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { AuthUser } from '../../../api/authUser';

const DOC_TYPES = [
  {
    key: 'aadhaar_front',
    type: 'aadhaar_front',
    title: 'Aadhaar Card (Front)',
    subtitle: 'Upload clear front side with photo and name',
    icon: 'id-card-outline',
    allowGallery: true,
    required: true,
  },
  {
    key: 'aadhaar_back',
    type: 'aadhaar_back',
    title: 'Aadhaar Card (Back)',
    subtitle: 'Upload clear back side with address and QR code',
    icon: 'id-card-outline',
    allowGallery: true,
    required: true,
  },
  {
    key: 'pan_front',
    type: 'pan_front',
    title: 'PAN Card (Front)',
    subtitle: 'Upload clear front side showing PAN number and name',
    icon: 'card-outline',
    allowGallery: true,
    required: true,
  },
  {
    key: 'pan_back',
    type: 'pan_back',
    title: 'PAN Card (Back)',
    subtitle: 'Upload clear back side of PAN card',
    icon: 'card-outline',
    allowGallery: true,
    required: true,
  },
];

export default function KycVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { callApi } = AuthUser();

  const { userData } = route.params || {};
  let parsedUser = {};
  try {
    parsedUser = typeof userData === 'string' ? JSON.parse(userData) : (userData || {});
  } catch (e) {
    parsedUser = {};
  }

  const workerId = parsedUser?.worker_id || parsedUser?.id;
  const userPhone = parsedUser?.phone || parsedUser?.mobile || parsedUser?.worker_phone || '';

  // App State: Keeps only local preview URI and server-generated file_name (No heavy base64 strings!)
  const [documents, setDocuments] = useState({
    aadhaar_front: null,
    aadhaar_back: null,
    pan_front: null,
    pan_back: null,
  });

  const [aadhaarNumber, setAadhaarNumber] = useState(parsedUser?.aadhaar_number || '');
  const [panNumber, setPanNumber] = useState(parsedUser?.pan_number || '');
  const [activeDocKey, setActiveDocKey] = useState(null);
  const activeDocKeyRef = useRef(null);
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

  /**
   * Instant Upload Handler:
   * Uploads file immediately upon capture/selection to POST /app/post_upload_document
   * Saves the returned file_name in state.
   */
  const uploadInstantDoc = async (docKey, pickedImage) => {
    const docConfig = DOC_TYPES.find((d) => d.key === docKey);
    const backendType = docConfig?.type || docKey;

    // 1. Immediately update UI state with local preview and uploading spinner
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        uri: pickedImage.path,
        fileName: null,
        fileUrl: null,
        uploading: true,
        error: null,
        rawImage: pickedImage, // Temporarily kept for retry if upload fails
      },
    }));

    try {
      const base64Data = pickedImage.data
        ? `data:${pickedImage.mime || 'image/jpeg'};base64,${pickedImage.data}`
        : null;

      let response;

      // 1. Primary: Send Base64 to /upload_document (Fast, tested 200 OK on LiteSpeed server)
      if (base64Data) {
        response = await callApi({
          api: '/upload_document',
          method: 'POST',
          data: {
            file: base64Data,
            type: backendType,
          },
        });
      }

      let resData = response?.response;
      let fileName = resData?.file_name || response?.file_name;
      let fileUrl = resData?.file_url || response?.file_url;

      // 2. Fallback: If Base64 didn't return fileName, try multipart upload
      if (!fileName) {
        const fileObj = {
          uri: Platform.OS === 'android' ? pickedImage.path : pickedImage.path.replace('file://', ''),
          type: pickedImage.mime || 'image/jpeg',
          name: `${docKey}_${Date.now()}.jpg`,
        };

        response = await callApi({
          api: '/upload_document',
          method: 'CUSTOM_POST',
          data: {
            file: fileObj,
            type: backendType,
          },
        });

        resData = response?.response;
        fileName = resData?.file_name || response?.file_name;
        fileUrl = resData?.file_url || response?.file_url;
      }

      // 3. Fallback: If /upload_document failed, try /post_upload_document
      if (!fileName && base64Data) {
        response = await callApi({
          api: '/post_upload_document',
          method: 'POST',
          data: {
            file: base64Data,
            type: backendType,
          },
        });
        resData = response?.response;
        fileName = resData?.file_name || response?.file_name;
        fileUrl = resData?.file_url || response?.file_url;
      }

      if ((response?.status === 1 || resData?.status === 'OK') && fileName) {
        // SUCCESS: Keep only fileName and local URI; drop heavy base64/rawImage from memory
        setDocuments((prev) => ({
          ...prev,
          [docKey]: {
            uri: pickedImage.path,
            fileName: fileName,
            fileUrl: fileUrl,
            uploading: false,
            error: null,
            rawImage: null,
          },
        }));

        Toast.show({
          type: 'success',
          text1: `${docConfig?.title || 'Document'} uploaded successfully`,
        });
      } else {
        const errMsg =
          resData?.message ||
          response?.message ||
          'Failed to upload document. Please retry.';
        setDocuments((prev) => ({
          ...prev,
          [docKey]: {
            uri: pickedImage.path,
            fileName: null,
            fileUrl: null,
            uploading: false,
            error: errMsg,
            rawImage: pickedImage,
          },
        }));

        Toast.show({
          type: 'error',
          text1: errMsg,
        });
      }
    } catch (error) {
      const errMsg = error.message || 'Network error while uploading';
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          uri: pickedImage.path,
          fileName: null,
          fileUrl: null,
          uploading: false,
          error: errMsg,
          rawImage: pickedImage,
        },
      }));

      Toast.show({
        type: 'error',
        text1: errMsg,
      });
    }
  };

  const handleCaptureCamera = async (isFrontCamera = false, targetDocKey = null) => {
    setShowPickerModal(false);
    const docKey = targetDocKey || activeDocKeyRef.current || activeDocKey;
    if (!docKey) {
      console.warn('handleCaptureCamera: No docKey specified');
      return;
    }

    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 1200,
        height: 1200,
        cropping: false,
        includeBase64: true,
        useFrontCamera: isFrontCamera,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      if (image && docKey) {
        await uploadInstantDoc(docKey, image);
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

  const handlePickGallery = async (targetDocKey = null) => {
    setShowPickerModal(false);
    const docKey = targetDocKey || activeDocKeyRef.current || activeDocKey;
    if (!docKey) {
      console.warn('handlePickGallery: No docKey specified');
      return;
    }

    try {
      const image = await ImagePicker.openPicker({
        width: 1200,
        height: 1200,
        cropping: false,
        includeBase64: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      if (image && docKey) {
        await uploadInstantDoc(docKey, image);
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.warn('Picker error:', error);
      }
    }
  };

  const openPickerFor = (doc) => {
    activeDocKeyRef.current = doc.key;
    setActiveDocKey(doc.key);
    if (doc.isLive) {
      // Live selfie goes straight to front camera with exact doc key
      handleCaptureCamera(true, doc.key);
    } else {
      setShowPickerModal(true);
    }
  };

  const removeDoc = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  };

  const handleRetryUpload = (docKey) => {
    activeDocKeyRef.current = docKey;
    setActiveDocKey(docKey);
    const doc = documents[docKey];
    if (doc?.rawImage) {
      uploadInstantDoc(docKey, doc.rawImage);
    } else {
      const docConfig = DOC_TYPES.find((d) => d.key === docKey);
      if (docConfig) {
        openPickerFor(docConfig);
      }
    }
  };

  const requiredDocs = DOC_TYPES.filter((d) => d.required);
  const completedRequiredCount = requiredDocs.filter(
    (d) => !!documents[d.key]?.fileName
  ).length;
  const isAllComplete = completedRequiredCount === requiredDocs.length;
  const isAnyUploading = Object.values(documents).some((d) => d?.uploading);
  const totalUploadedCount = Object.values(documents).filter((d) => !!d?.fileName).length;

  /**
   * Final Registration Submit (Step 3):
   * Sends saved file_name strings instead of heavy Base64 strings!
   * Calls POST /app/post_signupPro (step 3)
   */
  const handleSubmitStep3 = async () => {
    if (!workerId && !userPhone) {
      Toast.show({
        type: 'error',
        text1: 'Worker ID is missing. Please restart registration.',
      });
      return;
    }

    if (isAnyUploading) {
      Toast.show({
        type: 'info',
        text1: 'Please wait, documents are still uploading...',
      });
      return;
    }

    if (!documents.aadhaar_front?.fileName) {
      Toast.show({ type: 'error', text1: 'Please upload Aadhaar Card Front' });
      return;
    }
    if (!documents.aadhaar_back?.fileName) {
      Toast.show({ type: 'error', text1: 'Please upload Aadhaar Card Back' });
      return;
    }
    if (!documents.pan_front?.fileName) {
      Toast.show({ type: 'error', text1: 'Please upload PAN Card Front' });
      return;
    }
    if (!documents.pan_back?.fileName) {
      Toast.show({ type: 'error', text1: 'Please upload PAN Card Back' });
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        step: 3,
        worker_id: String(workerId || ''),
        phone: String(userPhone || ''),
        ...(parsedUser?.name ? { name: parsedUser.name } : {}),
        ...(parsedUser?.email ? { email: parsedUser.email } : {}),
        ...(parsedUser?.gender ? { gender: parsedUser.gender } : {}),
        ...(parsedUser?.dob ? { dob: parsedUser.dob } : {}),
        ...(parsedUser?.religion ? { religion: parsedUser.religion } : {}),
        aadhaar_front: documents.aadhaar_front.fileName,
        aadhaar_back: documents.aadhaar_back.fileName,
        pan_front: documents.pan_front.fileName,
        pan_back: documents.pan_back.fileName,
      };

      let response = await callApi({
        api: '/signupPro',
        method: 'POST',
        data: payload,
      });

      // Fallback if signupPro is mapped as post_signupPro
      if (!response || (response.status === 0 && response.message?.includes('404'))) {
        response = await callApi({
          api: '/signupPro',
          method: 'POST',
          data: payload,
        });
      }

      const resData = response?.response;

      if (response?.status === 1 || resData?.status === 'OK') {
        Toast.show({
          type: 'success',
          text1: resData?.message || 'Application submitted! Waiting for admin approval.',
        });

        setTimeout(() => {
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
          'Failed to complete registration';
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
          Upload government-issued IDs and take a live selfie to verify your provider profile. Photos are uploaded instantly for fast processing.
        </Text>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Documents Uploaded</Text>
            <Text style={styles.progressCount}>
              {completedRequiredCount}/{requiredDocs.length} Required {totalUploadedCount > completedRequiredCount ? `(${totalUploadedCount} Total)` : ''}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedRequiredCount / requiredDocs.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* List of Documents */}
        <Text style={styles.sectionHeaderTitle}>Upload Documents</Text>

        {DOC_TYPES.map((doc) => {
          const docState = documents[doc.key];
          const isUploaded = !!docState?.fileName;
          const isUploading = !!docState?.uploading;
          const hasError = !!docState?.error;

          return (
            <View
              key={doc.key}
              style={[
                styles.docCard,
                isUploaded && styles.docCardUploaded,
                isUploading && styles.docCardUploading,
                hasError && styles.docCardError,
                doc.isLive && styles.docCardLive,
              ]}
            >
              <View style={styles.docCardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    isUploaded && styles.iconBoxUploaded,
                    isUploading && styles.iconBoxUploading,
                    hasError && styles.iconBoxError,
                    doc.isLive && styles.iconBoxLive,
                  ]}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#1BA9A2" />
                  ) : (
                    <Icon
                      name={
                        isUploaded
                          ? 'checkmark-circle'
                          : hasError
                          ? 'alert-circle'
                          : doc.icon
                      }
                      size={22}
                      color={
                        isUploaded
                          ? '#10B981'
                          : hasError
                          ? '#EF4444'
                          : doc.isLive
                          ? '#3B82F6'
                          : '#1BA9A2'
                      }
                    />
                  )}
                </View>

                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docTitle}>
                      {doc.title} {!doc.required && <Text style={styles.optionalText}>(Optional)</Text>}
                    </Text>

                    {/* Status Badge */}
                    {doc.isLive && (
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>LIVE CAMERA</Text>
                      </View>
                    )}
                    {isUploaded && (
                      <View style={styles.uploadedBadge}>
                        <Icon name="checkmark" size={12} color="#10B981" />
                        <Text style={styles.uploadedBadgeText}>Uploaded</Text>
                      </View>
                    )}
                    {isUploading && (
                      <View style={styles.uploadingBadge}>
                        <Text style={styles.uploadingBadgeText}>Uploading...</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                </View>
              </View>

              {/* Preview Thumbnail or Upload Button */}
              {docState?.uri ? (
                <View style={styles.previewContainer}>
                  <View style={styles.previewImageWrapper}>
                    <Image
                      source={{ uri: docState.uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    {isUploading && (
                      <View style={styles.previewUploadingOverlay}>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={styles.previewUploadingText}>Uploading...</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.previewActions}>
                    {hasError && (
                      <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => handleRetryUpload(doc.key)}
                        disabled={isUploading}
                      >
                        <Icon name="refresh-outline" size={16} color="#DC2626" />
                        <Text style={styles.retryText}>Retry</Text>
                      </TouchableOpacity>
                    )}

                    {!isUploading && isUploaded && (
                      <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={() => openPickerFor(doc)}
                      >
                        <Icon name="camera-reverse-outline" size={16} color="#1BA9A2" />
                        <Text style={styles.retakeText}>Retake</Text>
                      </TouchableOpacity>
                    )}

                    {!isUploading && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeDoc(doc.key)}
                      >
                        <Icon name="trash-outline" size={16} color="#EF4444" />
                        <Text style={styles.deleteText}>Remove</Text>
                      </TouchableOpacity>
                    )}
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

              {/* Error Message if upload failed */}
              {hasError && (
                <View style={styles.errorNotice}>
                  <Icon name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorNoticeText}>
                    {docState.error || 'Upload failed. Tap Retry.'}
                  </Text>
                </View>
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
            (!isAllComplete || isAnyUploading || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitStep3}
          disabled={!isAllComplete || isAnyUploading || submitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              isAllComplete && !isAnyUploading
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
                {isAnyUploading
                  ? 'Uploading Documents...'
                  : isAllComplete
                  ? 'Complete Registration'
                  : `Upload Required Docs (${completedRequiredCount}/${requiredDocs.length})`}
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
              onPress={() => handleCaptureCamera(false, activeDocKeyRef.current)}
            >
              <View style={[styles.modalIconBox, styles.modalIconBoxCamera]}>
                <Icon name="camera-outline" size={22} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.modalOptionTitle}>Take Photo</Text>
                <Text style={styles.modalOptionSub}>Use camera to scan document</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePickGallery(activeDocKeyRef.current)}
            >
              <View style={[styles.modalIconBox, styles.modalIconBoxGallery]}>
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
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 4,
  },
  idInputsSection: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputIconBox: {
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
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
  docCardUploading: {
    borderColor: '#1BA9A2',
    backgroundColor: '#F9FFFE',
  },
  docCardError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
  iconBoxUploading: {
    backgroundColor: '#E6F7F6',
  },
  iconBoxError: {
    backgroundColor: '#FEE2E2',
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
    flexWrap: 'wrap',
    gap: 6,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
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
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uploadedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  uploadingBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uploadingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  docSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
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
  previewImageWrapper: {
    position: 'relative',
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewUploadingText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
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
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorNoticeText: {
    fontSize: 12,
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
  modalIconBoxCamera: {
    backgroundColor: '#E0F2FE',
  },
  modalIconBoxGallery: {
    backgroundColor: '#F0FDF4',
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
