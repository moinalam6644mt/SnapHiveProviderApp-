import { Pencil } from "lucide-react-native";
import { useRef, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";

import { theme } from '../../styles/globalStyles';
export default function OtpCard({ mobile, onBack }) {
  const navigation = useNavigation();
  const { login, verifyOtpCentral } = useContext(AuthContext);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const inputs = useRef([]);

  const handleEditMobile = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      Toast.show({
        type: "error",
        text1: "Please enter 4 digit OTP",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Processing...",
    });

    try {
      const response = await verifyOtpCentral(mobile, finalOtp, "2");


      if (response?.status === 1) {
        const loginStatus = response?.response?.data?.login_status;

        if (loginStatus == 1) {
          const fullUserData = response?.response?.data;
          login(fullUserData);

          Toast.show({
            type: "success",
            text1: "Login Successful",
          });

          setTimeout(() => {
            navigation.replace("Main", {
              screen: "HomeMain",
            });
          }, 1200);
        } else if (loginStatus == 0) {
          setTimeout(() => {
            navigation.replace("VerificationLoginScreen");
          }, 1200);
        } else {
          Toast.show({
            type: "error",
            text1: "Unexpected login status",
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1:
            response?.response?.errors?.[0]?.message ||
            response?.response?.message ||
            "OTP Verification Failed",
        });
      }
    } catch (error) {
      console.warn("VERIFY OTP ERROR:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the 4-digit code sent to</Text>

      <View style={styles.mobileRow}>
        <Text style={styles.mobile}>+91 {mobile}</Text>

        <TouchableOpacity style={styles.editIcon} onPress={handleEditMobile}>
          <Pencil size={12} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[
              styles.otpBox,
              focusedIndex === index && styles.otpBoxFocused,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectionColor={theme.primary}
          />
        ))}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.didntGet}>Didn’t get it?</Text>
        <Text style={styles.timer}>00:12</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderWidth: 0.25,
    borderColor: '#308695',
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
  },
  mobileRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  mobile: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  editIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 15,
  },
  otpBox: {
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  otpBoxFocused: {
    borderColor: theme.primary,
    borderWidth: 1.5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 10,
  },
  didntGet: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  timer: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.primary,
  },
  button: {
    marginTop: 24,
    height: 48,
    backgroundColor: theme.primary,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: "700",
  },
});
