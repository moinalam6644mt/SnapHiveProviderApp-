import { StyleSheet } from 'react-native';

import { theme } from '../../styles/globalStyles';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  /* TOP SECTION */
  topSection: {
    height: '42%',
    backgroundColor: '#2E2A72',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },

  topBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },

  tagline: {
    marginTop: 6,
    fontSize: 13,
    color: '#E5E5E5',
  },

  /* SPACE BELOW HEADER */
  bottomSection: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  /* FLOATING CARD */
  card: {
    position: 'absolute',
    top: '28%',
    left: 15,
    right: 15,
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 18,

    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E2A72',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },

  /* INPUT */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },

  /* BUTTON */
  button: {
    backgroundColor: '#F58220',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  buttonActive: {
    backgroundColor: '#F58220',
  },

  buttonText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: '600',
  },

  skip: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 10,
  },

  /* TERMS */
  terms: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    fontSize: 12,
    color: '#8A8A8A',
  },

  link: {
    color: '#2E2A72',
    fontWeight: '600',
  },

  /* ================= OTP SCREEN ================= */

  mobileNumberContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },

  mobileNumberText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 4,
  },

  mobileNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  mobileNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2A72',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },


  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#fff',
  },
  otpInputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },

  otpErrorText: {
    color: '#ff3b30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    bottom:5
  },

  /* RESEND */
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  resendText: {
    color: '#666',
    fontSize: 14,
  },

  timerText: {
    fontSize: 14,
    color: '#2E2A72',
    fontWeight: '600',
  },

  resendActive: {
    color: '#F58220',
  },
  inputContainer: {
    marginBottom: 12,
  },

  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 1,
    backgroundColor: '#fff5f5',
  },

  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  scrollContent: {
  flexGrow: 1,
  paddingBottom: 20,
},
inputContainer: {
  marginBottom: 16,
},
inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  height: 50,
  backgroundColor: '#F5F5F5',
},
inputError: {
  borderColor: '#ff3b30',
  borderWidth: 1,
},
input: {
  flex: 1,
  marginLeft: 10,
  fontSize: 16,
  color: '#333',
},
errorText: {
  color: '#ff3b30',
  fontSize: 12,
  marginTop: 4,
  marginLeft: 12,
},
});

export default styles;