// src/styles/globalStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  primary: '#2BAAB1',
  accent: '#ff7a00',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#1bb21b',
  surface: '#f9f9f9',
  background: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#777777',
  border: '#e0e0e0',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2BAAB1',
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* ================= LOGO STYLES ================= */
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
    shadowColor: '#2EC4B6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  logoContainerSmall: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },

  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },

  logoSmall: {
    width: 160,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: 5,
  },

  brandNameSmall: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  /* ================= CARD STYLES ================= */
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 28,
    paddingTop: 45,
    paddingBottom: 40,
    marginHorizontal: 22,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  /* ================= TYPOGRAPHY ================= */
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2BAAB1',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
    paddingHorizontal: 15,
  },

  /* ================= INPUT STYLES ================= */
  inputContainer: {
    marginBottom: 18,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E8ECEF',
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },

  inputFocused: {
    borderColor: '#2BAAB1',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },

  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#FFF5F5',
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 20,
    fontWeight: '500',
  },

  /* ================= BUTTON STYLES ================= */
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: '#2BAAB1',
    shadowColor: '#2BAAB1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ================= LINK STYLES ================= */
  skipText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#95A5A6',
    marginTop: 22,
    fontWeight: '600',
  },

  /* ================= TERMS STYLES ================= */
  termsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  terms: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.9,
  },

  link: {
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* ================= BACK BUTTON ================= */
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },

  /* ================= OTP SCREEN STYLES ================= */
  mobileNumberContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderRadius: 20,
    marginHorizontal: 10,
  },

  mobileNumberText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 6,
    fontWeight: '500',
  },

  mobileNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2BAAB1',
    marginLeft: 8,
  },

  userNameText: {
    fontSize: 14,
    color: '#2BAAB1',
    marginTop: 6,
    fontWeight: '500',
  },

  otpContainerWrapper: {
    marginBottom: 25,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },

  otpInput: {
    width: 55,
    height: 60,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#2BAAB1',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E8ECEF',
  },

  otpInputFocused: {
    borderColor: '#2BAAB1',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },

  otpInputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#FFF5F5',
  },

  otpErrorText: {
    color: '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
  },

  resendText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },

  timerText: {
    fontSize: 14,
    color: '#2BAAB1',
    fontWeight: '700',
  },

  timerTextDisabled: {
    color: '#BDC3C7',
  },

  resendActive: {
    color: '#2BAAB1',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ================= REGISTER SCREEN STYLES ================= */
  inputIcon: {
    width: 24,
    alignItems: 'center',
  },

  helperText: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 5,
    marginLeft: 20,
  },

  /* ================= LOADING OVERLAY ================= */
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
