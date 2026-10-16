import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
  StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthUser } from '../../../api/authUser';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';

const { width, height } = Dimensions.get('window');

const FloatingLabelInput = ({
  icon,
  label,
  value,
  onChangeText,
  error,
  isPassword,
  rightIcon,
  onRightIconPress,
  editable = true,
  pointerEvents = 'auto',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, isFocused, value]);

  const topStyle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -10],
  });

  const fontSizeStyle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', '#1BA9A2'],
  });

  return (
    <View style={{ marginBottom: 20 }} pointerEvents={pointerEvents}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: editable ? '#ffffff' : '#F9FAFB',
          borderWidth: 1.5,
          borderColor: error ? '#EF4444' : isFocused ? '#1BA9A2' : '#E5E7EB',
          borderRadius: 14,
          height: 56,
          paddingHorizontal: 16,
        }}
      >
        <Icon
          name={icon}
          size={20}
          color={error ? '#EF4444' : isFocused ? '#1BA9A2' : '#9CA3AF'}
        />
        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
          <Animated.Text
            style={{
              position: 'absolute',
              left: -4,
              top: topStyle,
              fontSize: fontSizeStyle,
              color: error ? '#EF4444' : labelColor,
              backgroundColor: editable ? '#ffffff' : '#F9FAFB',
              paddingHorizontal: 4,
              zIndex: 1,
            }}
          >
            {label}
          </Animated.Text>
          <TextInput
            {...props}
            style={[{ flex: 1, fontSize: 15, color: '#111827', height: '100%', paddingTop: (isFocused || value) ? 12 : 0 }]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isPassword && !showPassword}
            editable={editable}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
          />
        </View>
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
            <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={{ padding: 6 }} disabled={!onRightIconPress}>
            <Icon name={rightIcon} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 5 }}>{error}</Text> : null}
    </View>
  );
};

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { callApi } = AuthUser();

  const [fullName, setFullName] = useState(route.params?.name || "");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [email, setEmail] = useState(route.params?.email || "");
  const [password, setPassword] = useState("");
  const [sameWhatsapp, setSameWhatsapp] = useState(true);

  useEffect(() => {
    if (route.params?.name) setFullName(route.params.name);
    if (route.params?.email) setEmail(route.params.email);
  }, [route.params?.name, route.params?.email]);

  const [religionList, setReligionList] = useState([]);
  const [selectedReligionName, setSelectedReligionName] = useState("");
  const [selectedReligionId, setSelectedReligionId] = useState(null);
  const [showReligionModal, setShowReligionModal] = useState(false);

  const [loading, setLoading] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sameWhatsapp) {
      setWhatsapp(mobile);
    }
  }, [mobile, sameWhatsapp]);

  const registerData = async () => {
    Keyboard.dismiss();

    if (!fullName.trim()) {
      Toast.show({ type: "error", text1: "Please enter Full Name" });
      return;
    }
    if (!dob.trim()) {
      Toast.show({ type: "error", text1: "Please enter Date of Birth" });
      return;
    }
    if (dob.length !== 10) {
      Toast.show({ type: "error", text1: "Please enter a complete Date of Birth (DD-MM-YYYY)" });
      return;
    }

    const [dayStr, monthStr, yearStr] = dob.split("-");
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();

    if (day >= 32 || day === 0) {
      Toast.show({ type: "error", text1: "Date must be less than 32" }); return;
    }
    if (month >= 13 || month === 0) {
      Toast.show({ type: "error", text1: "Month must be less than 13" }); return;
    }
    if (year >= currentYear) {
      Toast.show({ type: "error", text1: `Year must be less than ${currentYear}` }); return;
    }
    if (!selectedReligionId) {
      Toast.show({ type: "error", text1: "Please select Religion" }); return;
    }
    if (!mobile.trim()) {
      Toast.show({ type: "error", text1: "Please enter Mobile Number" }); return;
    }
    if (!(sameWhatsapp ? mobile : whatsapp).trim()) {
      Toast.show({ type: "error", text1: "Please enter Whatsapp Number" }); return;
    }
    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Please enter Email Address" }); return;
    }
    if (!password) {
      Toast.show({ type: "error", text1: "Please enter Password" }); return;
    }

    setLoading(true);

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
        password: password,
        ...(route.params?.google_id && { google_id: route.params.google_id }),
      };

      const response = await callApi({
        api: "/signupPro",
        method: "CUSTOM_POST",
        data: payload,
      });

      const resData = response?.response;

      if ((response?.status === 1 || resData?.status === "OK") && (resData?.calback === "nextstep" || resData?.status === "OK")) {
        Toast.show({
          type: "success",
          text1: resData?.message || "Step 1 completed. Please proceed to address details.",
        });

        const fullData = {
          ...payload,
          ...resData?.calbackdata,
        };

        setTimeout(() => {
          navigation.navigate("CompleteProfile", {
            userData: JSON.stringify(fullData),
          });
        }, 1200);
      } else {
        Toast.show({
          type: "error",
          text1: resData?.errors?.[0]?.message || resData?.message || response?.message || "Registration Failed",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: Platform.OS === 'ios' ? 50 : 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ padding: 8, marginLeft: -8 }}
              >
                <Icon name="arrow-back-outline" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
              Register Now
            </Text>
            <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 36, lineHeight: 22 }}>
              Create a provider account to get started
            </Text>

            {/* Form Fields */}
            <FloatingLabelInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              icon="person-outline"
            />

            {/* Gender Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={() => setGender('Male')}
                style={{
                  flex: 1, height: 56, borderRadius: 14,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: gender === 'Male' ? '#E6F5F6' : '#F3F4F6',
                  borderWidth: 1.5,
                  borderColor: gender === 'Male' ? '#1BA9A2' : 'transparent',
                }}
              >
                <Icon name={gender === 'Male' ? "male-outline" : "male"} size={20} color={gender === 'Male' ? '#1BA9A2' : '#9CA3AF'} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: gender === 'Male' ? '#111827' : '#6B7280' }}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('Female')}
                style={{
                  flex: 1, height: 56, borderRadius: 14,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: gender === 'Female' ? '#E6F5F6' : '#F3F4F6',
                  borderWidth: 1.5,
                  borderColor: gender === 'Female' ? '#1BA9A2' : 'transparent',
                }}
              >
                <Icon name={gender === 'Female' ? "female-outline" : "female"} size={20} color={gender === 'Female' ? '#1BA9A2' : '#9CA3AF'} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: gender === 'Female' ? '#111827' : '#6B7280' }}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Date of Birth */}
            <TouchableOpacity onPress={() => setOpenDatePicker(true)} activeOpacity={0.8}>
              <View pointerEvents="none">
                <FloatingLabelInput
                  label="Date of Birth"
                  value={dob}
                  icon="calendar-outline"
                  editable={false}
                  rightIcon="chevron-down-outline"
                />
              </View>
            </TouchableOpacity>

            {/* Religion */}
            <TouchableOpacity onPress={() => setShowReligionModal(true)} activeOpacity={0.8}>
              <View pointerEvents="none">
                <FloatingLabelInput
                  label="Select Religion"
                  value={selectedReligionName}
                  icon="heart-outline"
                  editable={false}
                  rightIcon="chevron-down-outline"
                />
              </View>
            </TouchableOpacity>

            {/* Mobile Number */}
            <FloatingLabelInput
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              icon="call-outline"
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* WhatsApp Checkbox */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: -8 }}
              onPress={() => setSameWhatsapp(!sameWhatsapp)}
              activeOpacity={0.7}
            >
              <View style={{
                width: 20, height: 20, borderRadius: 6,
                borderWidth: 1.5, borderColor: sameWhatsapp ? '#1BA9A2' : '#9CA3AF',
                backgroundColor: sameWhatsapp ? '#1BA9A2' : 'transparent',
                justifyContent: 'center', alignItems: 'center',
                marginRight: 10
              }}>
                {sameWhatsapp && <Icon name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={{ fontSize: 14, color: '#4B5563', fontWeight: '500' }}>Same for Whatsapp</Text>
            </TouchableOpacity>

            {/* WhatsApp Number */}
            <FloatingLabelInput
              label="Whatsapp Number"
              value={sameWhatsapp ? mobile : whatsapp}
              onChangeText={setWhatsapp}
              icon="logo-whatsapp"
              keyboardType="number-pad"
              maxLength={10}
              editable={!sameWhatsapp}
            />

            {/* Alternate Mobile */}
            <FloatingLabelInput
              label="Alternate Mobile (Optional)"
              value={alternateMobile}
              onChangeText={setAlternateMobile}
              icon="call-outline"
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Email Address */}
            <FloatingLabelInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <FloatingLabelInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword={true}
            />

            {/* Register Button */}
            <TouchableOpacity
              style={{
                height: 56, borderRadius: 14,
                overflow: 'hidden',
                opacity: loading ? 0.7 : 1,
                shadowColor: '#1BA9A2', shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                marginTop: 10,
                marginBottom: 40
              }}
              onPress={registerData}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1BA9A2', '#0A736F']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 }}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Religion Modal */}
      <Modal visible={showReligionModal} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}
          onPress={() => setShowReligionModal(false)}
          activeOpacity={1}
        >
          <View style={{ backgroundColor: "#FFF", borderRadius: 24, padding: 20, maxHeight: "80%" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 16, textAlign: "center" }}>
              Select Religion
            </Text>
            <FlatList
              data={religionList}
              keyExtractor={(i) => i.religion_id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
                  onPress={() => {
                    setSelectedReligionName(item.religion_name);
                    setSelectedReligionId(item.religion_id);
                    setShowReligionModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#374151", textAlign: "center" }}>
                    {item.religion_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
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
    </View>
  );
}
