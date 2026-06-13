import { StatusBar } from "react-native";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AuthUser } from "../../../api/authUser";
import Toast from "react-native-toast-message";
import DatePicker from "react-native-date-picker";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
// Simple responsive scaling function
const scale = (size) => (width / 375) * size;

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { callApi } = AuthUser();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [email, setEmail] = useState("");
  const [sameWhatsapp, setSameWhatsapp] = useState(true);

  const [religionList, setReligionList] = useState([]);
  const [selectedReligionName, setSelectedReligionName] = useState("");
  const [selectedReligionId, setSelectedReligionId] = useState(null);
  const [showReligionModal, setShowReligionModal] = useState(false);

  /* ================= API LOAD ================= */
  useEffect(() => {
    (async () => {
      try {
        const response = await callApi({
          api: "/signForm",
          method: "GET",
        });

        if (response?.response?.data?.religion) {
          setReligionList(response.response.data.religion);
        }
      } catch (e) {
        console.warn("API Error:", e);
      }
    })();
  }, []);

  /* ================= WHATSAPP SYNC ================= */
  useEffect(() => {
    if (sameWhatsapp) {
      setWhatsapp(mobile);
    }
  }, [mobile, sameWhatsapp]);

  /* ================= DOB FORMAT ================= */
  const formatDOB = (value) => {
    let cleaned = value.replace(/\D/g, "").slice(0, 8);

    // Auto-correct day to not exceed 31
    if (cleaned.length >= 2) {
      const dayPart = parseInt(cleaned.slice(0, 2), 10);
      if (dayPart >= 32) {
        cleaned = "31" + cleaned.slice(2);
      }
    }

    // Auto-correct month to not exceed 12
    if (cleaned.length >= 4) {
      const monthPart = parseInt(cleaned.slice(2, 4), 10);
      if (monthPart >= 13) {
        cleaned = cleaned.slice(0, 2) + "12" + cleaned.slice(4);
      }
    }

    let formatted = cleaned;

    if (cleaned.length > 4)
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(
        2,
        4,
      )}-${cleaned.slice(4)}`;
    else if (cleaned.length > 2)
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;

    setDob(formatted);
  };

  const registerData = async () => {
    if (!fullName.trim()) {
      Toast.show({ type: "error", text1: "Please enter Full Name" });
      return;
    }

    if (!dob.trim()) {
      Toast.show({ type: "error", text1: "Please enter Date of Birth" });
      return;
    }

    if (dob.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Please enter a complete Date of Birth (DD-MM-YYYY)",
      });
      return;
    }

    const [dayStr, monthStr, yearStr] = dob.split("-");
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();

    if (day >= 32 || day === 0) {
      Toast.show({ type: "error", text1: "Date must be less than 32" });
      return;
    }

    if (month >= 13 || month === 0) {
      Toast.show({ type: "error", text1: "Month must be less than 13" });
      return;
    }

    if (year >= currentYear) {
      Toast.show({
        type: "error",
        text1: `Year must be less than ${currentYear}`,
      });
      return;
    }

    if (!selectedReligionId) {
      Toast.show({ type: "error", text1: "Please select Religion" });
      return;
    }

    if (!mobile.trim()) {
      Toast.show({ type: "error", text1: "Please enter Mobile Number" });
      return;
    }

    if (!(sameWhatsapp ? mobile : whatsapp).trim()) {
      Toast.show({ type: "error", text1: "Please enter Whatsapp Number" });
      return;
    }

    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Please enter Email Address" });
      return;
    }

    try {
      const formattedDobForBackend = `${yearStr}-${monthStr}-${dayStr}`;

      const payload = {
        step: "1",
        name: fullName,
        gender: gender === "Male" ? "M" : "F",
        dob: formattedDobForBackend,
        religion: selectedReligionId,
        phone: mobile,
        alt_phone: alternateMobile || "",
        whatsapp: sameWhatsapp ? mobile : whatsapp,
        email: email,
      };

      console.log(payload);

      const response = await callApi({
        api: "/signupPro",
        method: "CUSTOM_POST",
        data: payload,
      });

      const resData = response?.response;

      if (resData?.status === "OK" && resData?.calback === "nextstep") {
        const fullData = {
          ...payload,
          ...resData?.calbackdata,
        };

        setTimeout(() => {
          navigation.navigate("CompleteProfile", {
            userData: JSON.stringify(fullData),
          });
        }, 1500);
      } else {
        Toast.show({
          type: "error",
          text1: resData?.errors[0].message || "Registration Failed",
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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Register Now</Text>
            </View>

            <View style={styles.bottomSheet}>
              <Input
                icon={<User size={18} color="#6B7280" />}
                placeholder="Full Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                }}
              />

              <View style={styles.genderRow}>
                <GenderButton
                  label="Male"
                  selected={gender === "Male"}
                  onPress={() => {
                    setGender("Male");
                  }}
                />
                <GenderButton
                  label="Female"
                  selected={gender === "Female"}
                  onPress={() => {
                    setGender("Female");
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  setOpenDatePicker(true);
                }}
              >
                <View pointerEvents="none">
                  <Input
                    icon={<Calendar size={18} color="#6B7280" />}
                    placeholder="DD-MM-YYYY"
                    value={dob}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowReligionModal(true);
                }}
              >
                <View pointerEvents="none">
                  <Input
                    icon={<User size={18} color="#6B7280" />}
                    placeholder="Select Religion"
                    value={selectedReligionName}
                    editable={false}
                    rightIcon={<ChevronDown size={18} color="#6B7280" />}
                  />
                </View>
              </TouchableOpacity>

              <Input
                icon={<Phone size={18} color="#6B7280" />}
                placeholder="Mobile Number"
                keyboardType="number-pad"
                value={mobile}
                maxLength={10}
                onChangeText={(text) => {
                  setMobile(text);
                }}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setSameWhatsapp(!sameWhatsapp);
                }}
              >
                <View
                  style={[styles.checkbox, sameWhatsapp && styles.checkboxActive]}
                >
                  {sameWhatsapp && <Check size={14} color="#FFF" />}
                </View>
                <Text style={styles.checkboxText}>Same for Whatsapp</Text>
              </TouchableOpacity>

              <Input
                icon={<MessageCircle size={18} color="#6B7280" />}
                placeholder="Whatsapp Number"
                keyboardType="number-pad"
                value={sameWhatsapp ? mobile : whatsapp}
                maxLength={10}
                editable={!sameWhatsapp}
                onChangeText={(text) => {
                  setWhatsapp(text);
                }}
              />

              <Input
                icon={<Phone size={18} color="#6B7280" />}
                placeholder="Alternate Mobile Number"
                keyboardType="number-pad"
                value={alternateMobile}
                maxLength={10}
                onChangeText={(text) => {
                  setAlternateMobile(text);
                }}
              />

              <Input
                icon={<Mail size={18} color="#6B7280" />}
                placeholder="Email Address"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                }}
              />

              <TouchableOpacity style={styles.buttonContainer} onPress={registerData} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#134E5E', '#71B280']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* ================= MODAL ================= */}
      <Modal visible={showReligionModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setShowReligionModal(false);
          }}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Religion</Text>

            <FlatList
              data={religionList}
              keyExtractor={(i) => i.religion_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedReligionName(item.religion_name);
                    setSelectedReligionId(item.religion_id);
                    setShowReligionModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {item.religion_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= DATE PICKER ================= */}
      <DatePicker
        modal
        mode="date"
        open={openDatePicker}
        date={date}
        maximumDate={new Date()}
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          setDate(selectedDate);

          const dayStr = String(selectedDate.getDate()).padStart(2, "0");
          const monthStr = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const yearStr = selectedDate.getFullYear();
          setDob(`${dayStr}-${monthStr}-${yearStr}`);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />
    </SafeAreaView>
  );
}

function Input({ icon, rightIcon, ...props }) {
  return (
    <View style={styles.inputBox}>
      <View style={styles.iconLeft}>{icon}</View>
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
      {rightIcon && <View>{rightIcon}</View>}
    </View>
  );
}

function GenderButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.genderBtn,
        selected ? styles.genderActive : styles.genderInactive,
      ]}
    >
      <View
        style={[
          styles.radio,
          selected ? styles.radioActive : styles.radioInactive,
        ]}
      >
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.genderText, selected && { color: "#1E1B4B" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradientBg: { flex: 1 },
  scrollContent: {
    paddingBottom: scale(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(16),
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    marginBottom: scale(20),
  },
  headerTitle: { fontSize: scale(22), fontWeight: "800", color: "#FFF" },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(40),
    borderTopRightRadius: scale(40),
    paddingHorizontal: scale(24),
    paddingTop: scale(40),
    paddingBottom: Platform.OS === 'ios' ? scale(40) : scale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    flex: 1,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: scale(16),
    paddingHorizontal: scale(16),
    height: scale(56),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconLeft: { marginRight: scale(12) },
  input: { flex: 1, fontSize: scale(15), color: "#333333", fontWeight: "600" },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(16),
    gap: scale(12),
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: scale(56),
    borderRadius: scale(16),
    gap: scale(10),
    borderWidth: 1,
    borderColor: "transparent",
  },
  genderActive: { backgroundColor: "#E6F5F6", borderColor: "#2BAAB1" },
  genderInactive: { backgroundColor: "#F3F4F6" },
  genderText: { fontSize: scale(15), fontWeight: "600", color: "#6B7280" },
  radio: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderWidth: 2, borderColor: "#2BAAB1" },
  radioInactive: { borderWidth: 1.5, borderColor: "#9CA3AF" },
  radioDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: "#2BAAB1",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(16),
    gap: scale(10),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(6),
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#2BAAB1",
    borderColor: "#2BAAB1",
  },
  checkboxText: { fontSize: scale(14), color: "#4B5563" },
  buttonContainer: {
    height: scale(60),
    borderRadius: scale(16),
    marginTop: scale(15),
    shadowColor: "#134E5E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: scale(16), fontWeight: "700", letterSpacing: 0.5 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    padding: scale(20),
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
    marginBottom: scale(16),
    textAlign: "center",
  },
  dropdownItem: {
    paddingVertical: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: scale(16),
    color: "#474747",
    textAlign: "center",
  },
});