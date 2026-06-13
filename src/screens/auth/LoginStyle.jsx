import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBg: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: height * 0.35,
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
    paddingBottom: 20,
  },
  logo: {
    width: width * 0.55,
    height: 70,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  tagline: {
    marginTop: 15,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 35,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    height: 60,
    borderRadius: 16,
    marginTop: 15,
    shadowColor: '#134E5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skip: {
    textAlign: 'center',
    fontSize: 15,
    color: '#6B7280',
    marginTop: 25,
    fontWeight: '600',
  },
  bottomSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  terms: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  link: {
    color: '#2BAAB1',
    fontWeight: '600',
  },

  /* ================= OTP SCREEN ================= */
  mobileNumberContainer: {
    alignItems: 'flex-start',
    marginBottom: 30,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  mobileNumberText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  mobileNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  userNameText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    fontWeight: '500',
  },
  otpContainerWrapper: {
    marginBottom: 25,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpInput: {
    width: (width - 60 - 45) / 4, // Calculate width perfectly based on padding
    height: 65,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1B4B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  otpInputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FEF2F2',
  },
  otpErrorText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 15,
    color: '#2BAAB1',
    fontWeight: '700',
  },
  timerTextDisabled: {
    color: '#9CA3AF',
  },
});

export default styles;