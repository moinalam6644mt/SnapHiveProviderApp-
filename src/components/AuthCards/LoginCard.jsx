import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { AuthUser } from "../../../api/authUser";

export default function LoginCard({ mobile, setMobile, onContinue }) {
  const navigation = useNavigation();
  const { callApi } = AuthUser();

  const handleChange = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    setMobile(cleaned);
  };

  const handleContinue = async () => {
    if (!mobile || mobile.trim().length === 0) {
      Toast.show({
        type: "error",
        text1: "Please enter mobile number",
      });
      return;
    }

    if (mobile.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Mobile number must be 10 digits",
      });
      return;
    }

    try {
      const payload = {
        mobile: mobile,
        step: "1"
      };


      const response = await callApi({
        method: "CUSTOM_POST",
        api: "/login_serviceProvider",
        data: payload,
      });


      if (response?.status === 1) {
        const message = response?.response?.message;
        const otp = response?.response?.otp;

        Toast.show({
          type: "success",
          text1: message || "OTP sent successfully",
        });

        // 2️⃣ Second toast after delay
        setTimeout(() => {
          Toast.show({
            type: "success",
            text1: `Your OTP is ${otp}`,
          });
        }, 1200);

        // 3️⃣ Move to OTP screen after toast
        setTimeout(() => {
          onContinue(mobile);
        }, 2000);
      } else {
        Toast.show({
          type: "error",
          text1:
            response?.response?.message ||
            "Failed to send OTP",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Login Your Account</Text>

      <Text style={styles.subtitle}>
        Enter Mobile Number, we’ll send an OTP verification code to you.
      </Text>

      <View style={styles.inputBox}>
        <Phone size={20} color="#777" style={{ marginRight: 12 }} />
        <TextInput
          value={mobile}
          onChangeText={handleChange}
          placeholder="Your Mobile Number"
          placeholderTextColor="#777"
          keyboardType="number-pad"
          maxLength={10}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>If new user? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Register now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E2E74",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#474747",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 22,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  button: {
    height: 48,
    backgroundColor: "#ED6E0A",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  registerText: {
    fontSize: 12,
    color: "#474747",
  },

  registerLink: {
    fontSize: 12,
    color: "#ED6E0A",
    fontWeight: "600",
  },
});
