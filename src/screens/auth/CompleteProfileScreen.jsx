import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import ImagePicker from "react-native-image-crop-picker";
import { AuthUser } from "../../../api/authUser";
import Toast from "react-native-toast-message";
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

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

export default function CompleteProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { callApi } = AuthUser();

  const { userData } = route.params || {};

  const [profileImage, setProfileImage] = useState(null);

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  const [states, setStates] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedStateName, setSelectedStateName] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [address, setAddress] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [showImageOptions, setShowImageOptions] = useState(false);

  const GOOGLE_API_KEY = 'AIzaSyChn8rDJqxakdzRIEAIGvCnZVce_soXW3s';

  // Address Search States
  const [mapSearchText, setMapSearchText] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [coordError, setCoordError] = useState(false);

  useEffect(() => {
    fetchListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchListData = async () => {
    try {
      const response = await callApi({
        api: "/signForm",
        method: "GET",
      });
      if (response?.response?.data?.all_service) {
        setServices(response.response.data.all_service);
      }
      if (response?.response?.data?.states) {
        setStates(response.response.data.states);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result !== RESULTS.GRANTED) {
          Toast.show({ type: "error", text1: "Camera permission denied" });
          setShowImageOptions(false);
          return;
        }
      } catch (err) {
        console.log("Permission error:", err.message);
        setShowImageOptions(false);
        return;
      }
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        includeBase64: true,
        mediaType: "photo",
      });
      
      if (image && image.data) {
        setProfileImage(`data:${image.mime};base64,${image.data}`);
      }
      setShowImageOptions(false);
    } catch (error) {
      if (
        error.message !== "User cancelled image selection" &&
        error.message !== "User did not grant camera permission."
      ) {
        console.log("Camera error:", error);
      }
      setShowImageOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        includeBase64: true,
        mediaType: "photo",
      });
      
      if (image && image.data) {
        setProfileImage(`data:${image.mime};base64,${image.data}`);
      }
      setShowImageOptions(false);
    } catch (error) {
      if (
        error.message !== "User cancelled image selection" &&
        error.message !== "User did not grant camera permission."
      ) {
        console.log("Image picker error:", error);
      }
      setShowImageOptions(false);
    }
  };

  const handlePlaceSearch = async (text) => {
    setMapSearchText(text);
    if (text.length > 2) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}&components=country:in`;
        const res = await axios.get(url);
        if (res.data.status === 'OK') {
          setPredictions(res.data.predictions);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.log("Place API Error:", err.message);
      }
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPlace = async (placeId, description) => {
    setMapSearchText(description);
    setPredictions([]);
    
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
      const res = await axios.get(url);
      if (res.data.status === 'OK' && res.data.results.length > 0) {
        const result = res.data.results[0];
        const { lat, lng } = result.geometry.location;
        setLatitude(lat);
        setLongitude(lng);
        parseGoogleAddress(result, description);
      }
    } catch (err) {
      console.log("Geocode API Error:", err.message);
    }
  };

  const parseGoogleAddress = (result, fullAddress) => {
    let fetchedCity = "";
    let fetchedState = "";
    let fetchedPostal = "";
    let fetchedStreet = "";

    result.address_components.forEach(component => {
      if (component.types.includes("locality")) {
        fetchedCity = component.long_name;
      }
      if (component.types.includes("administrative_area_level_1")) {
        fetchedState = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        fetchedPostal = component.long_name;
      }
      if (component.types.includes("sublocality") || component.types.includes("route")) {
        fetchedStreet = component.long_name;
      }
    });

    setCity(fetchedCity);
    setPostalCode(fetchedPostal);
    if (!street) setStreet(fetchedStreet);
    setAddress(fullAddress);
    setMapSearchText(fullAddress);

    if (states.length > 0 && fetchedState) {
      const matchedState = states.find(s => s.state_name.toLowerCase() === fetchedState.toLowerCase());
      if (matchedState) {
        setSelectedStateId(matchedState.state_id);
        setSelectedStateName(matchedState.state_name);
      } else {
        setSelectedStateName(fetchedState);
        setSelectedStateId(null);
      }
    } else {
      setSelectedStateName(fetchedState);
    }
  }

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setCoordError(false);
    setPredictions([]);

    if (Platform.OS === 'android') {
      try {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (result !== RESULTS.GRANTED) {
          Toast.show({ type: "error", text1: "Location permission denied" });
          setIsLocating(false);
          return;
        }
      } catch (err) {
        console.log("Location err:", err.message);
        setIsLocating(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);

        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
          const response = await axios.get(url);
          if (response.data.status === 'OK' && response.data.results.length > 0) {
            parseGoogleAddress(response.data.results[0], response.data.results[0].formatted_address);
          }
        } catch (error) {
          console.log("Reverse Geocode Error:", error.message);
          Toast.show({ type: "error", text1: "Could not fetch address details" });
        }
        setIsLocating(false);
      },
      (error) => {
        console.log("Geolocation error:", error.message);
        setCoordError(true);
        setIsLocating(false);
        Toast.show({ type: "error", text1: "Could not get current location" });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!userData) {
      Toast.show({ type: "error", text1: "Missing previous data" });
      return;
    }

    if (selectedServices.length === 0) {
      Toast.show({ type: "error", text1: "Please select at least one Service Category" });
      return;
    }

    if (!address.trim()) {
      Toast.show({ type: "error", text1: "Please enter Address" });
      return;
    }

    if (!houseNo.trim()) {
      Toast.show({ type: "error", text1: "Please enter House / Flat No." });
      return;
    }

    if (!street.trim()) {
      Toast.show({ type: "error", text1: "Please enter Street / Area" });
      return;
    }

    if (!city.trim()) {
      Toast.show({ type: "error", text1: "Please enter City" });
      return;
    }

    if (!postalCode.trim()) {
      Toast.show({ type: "error", text1: "Please enter Postal Code" });
      return;
    }

    if (!selectedStateId) {
      Toast.show({ type: "error", text1: "Please select State" });
      return;
    }

    if (!landmark.trim()) {
      Toast.show({ type: "error", text1: "Please enter Land Mark" });
      return;
    }

    let parsedData = {};
    try {
      parsedData = JSON.parse(userData);
    } catch (e) {
      parsedData = {};
    }

    const phone = parsedData?.phone;
    if (!phone) {
      Toast.show({ type: "error", text1: "Phone number is missing from Step 1" });
      return;
    }

    const fullAddress = `${houseNo.trim()}, ${street.trim()}, ${address.trim()}`;
    const serviceIds = selectedServices.map((s) => s.category_subchild_id || s.id);

    const payload = {
      step: "2",
      phone: phone,
      worker_address: fullAddress,
      worker_city: city.trim(),
      worker_state: selectedStateId,
      worker_pincode: postalCode.trim(),
      worker_landmark: landmark.trim(),
      worker_services: serviceIds,
      ...(profileImage && { logo: profileImage }),
    };

    setLoading(true);

    try {
      const response = await callApi({
        api: "/signupPro",
        method: "CUSTOM_POST",
        data: payload,
      });

      const resData = response?.response;

      if (response?.status === 1 || resData?.status === "OK") {
        const calbackData = resData?.calbackdata || {};
        const workerId = calbackData?.worker_id || resData?.worker_id || response?.worker_id;

        Toast.show({
          type: "success",
          text1: resData?.message || "Address saved! Proceed to KYC documents.",
        });

        const step3Payload = {
          ...parsedData,
          ...calbackData,
          worker_id: workerId,
          phone: phone,
          name: parsedData?.name || calbackData?.name,
        };

        setTimeout(() => {
          navigation.navigate("KycVerification", {
            userData: JSON.stringify(step3Payload),
          });
        }, 1200);
      } else {
        const errMsg =
          resData?.errors?.[0]?.message ||
          resData?.message ||
          response?.message ||
          "Failed to save address details";
        Toast.show({
          type: "error",
          text1: errMsg,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message || "Something went wrong",
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
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 40 }}
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
              Complete Profile
            </Text>
            <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 24, lineHeight: 22 }}>
              Let's add some more details about your services.
            </Text>

            {/* Profile Photo */}
            <View style={{ alignSelf: "center", marginVertical: 20 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F3F4F6",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#E5E7EB",
              }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Icon name="person-outline" size={40} color="#9CA3AF" />
                )}
              </View>

              <TouchableOpacity 
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  backgroundColor: "#1BA9A2",
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#FFF"
                }} 
                onPress={() => setShowImageOptions(true)}
              >
                <Icon name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Service Category */}
            <TouchableOpacity onPress={() => setShowServiceDropdown(!showServiceDropdown)} activeOpacity={0.8}>
              <View pointerEvents="none">
                <FloatingLabelInput
                  label="Select Service Categories"
                  value={selectedServices.length > 0 ? selectedServices.map((s) => s.category_subchild_name).join(", ") : ""}
                  icon="briefcase-outline"
                  editable={false}
                  rightIcon="chevron-down-outline"
                />
              </View>
            </TouchableOpacity>

            {/* SERVICE CATEGORY DROPDOWN */}
            {showServiceDropdown && (
              <View style={{
                backgroundColor: "#FFF",
                borderRadius: 14,
                marginBottom: 20,
                marginTop: -10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                overflow: "hidden"
              }}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {services.map((item) => {
                    const isSelected = selectedServices.some(
                      (s) => s.category_subchild_id === item.category_subchild_id
                    );
                    return (
                      <TouchableOpacity
                        key={item.category_subchild_id}
                        style={{
                          padding: 16,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottomWidth: 1,
                          borderBottomColor: "#F3F4F6",
                          backgroundColor: isSelected ? "#F0FDFA" : "#FFF"
                        }}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedServices(
                              selectedServices.filter((s) => s.category_subchild_id !== item.category_subchild_id)
                            );
                          } else {
                            setSelectedServices([...selectedServices, item]);
                          }
                        }}
                      >
                        <Text style={{ fontSize: 15, color: isSelected ? "#0A736F" : "#374151", fontWeight: isSelected ? "600" : "400" }}>
                          {item.category_subchild_name}
                        </Text>
                        {isSelected && <Icon name="checkmark-circle" size={20} color="#1BA9A2" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Map Search */}
            <View style={{ position: "relative", zIndex: 999 }}>
              <FloatingLabelInput
                label="Search for area, street..."
                value={mapSearchText}
                onChangeText={handlePlaceSearch}
                icon="search-outline"
              />
              {predictions.length > 0 && (
                <View style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 14,
                  maxHeight: 180,
                  position: "absolute",
                  top: 60,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {predictions.map((p) => (
                      <TouchableOpacity
                        key={p.place_id}
                        style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
                        onPress={() => handleSelectPlace(p.place_id, p.description)}
                      >
                        <Text style={{ fontSize: 14, color: "#374151" }}>{p.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Current Location Button */}
            <TouchableOpacity 
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "#1BA9A2",
                borderStyle: "dashed",
                borderRadius: 14,
                height: 50,
                marginBottom: 20,
                marginTop: -10,
                gap: 8,
                backgroundColor: "#F0FDFA"
              }} 
              onPress={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator color="#1BA9A2" size="small" />
              ) : (
                <>
                  <Icon name="navigate-outline" size={18} color="#1BA9A2" />
                  <Text style={{ fontSize: 15, color: "#1BA9A2", fontWeight: "600" }}>Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Coordinates Status */}
            {coordError ? (
              <View style={{ backgroundColor: "#FEF3C7", padding: 12, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ color: "#D97706", fontSize: 13, textAlign: "center" }}>Coordinates required. Please search or use current location.</Text>
              </View>
            ) : latitude && longitude ? (
              <View style={{ backgroundColor: "#DCFCE7", padding: 12, borderRadius: 10, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon name="location" size={16} color="#166534" />
                <Text style={{ color: "#166534", fontSize: 13, fontWeight: "600" }}>Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}</Text>
              </View>
            ) : null}

            <FloatingLabelInput label="Address*" value={address} onChangeText={setAddress} icon="location-outline" />
            <FloatingLabelInput label="House / Flat No.*" value={houseNo} onChangeText={setHouseNo} icon="home-outline" />
            <FloatingLabelInput label="Locality" value={street} onChangeText={setStreet} icon="trail-sign-outline" />
            <FloatingLabelInput label="City" value={city} onChangeText={setCity} icon="business-outline" />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <FloatingLabelInput label="PIN Code" value={postalCode} onChangeText={setPostalCode} icon="keypad-outline" keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setShowStateDropdown(!showStateDropdown)} activeOpacity={0.8}>
                  <View pointerEvents="none">
                    <FloatingLabelInput
                      label="State"
                      value={selectedStateName}
                      icon="map-outline"
                      editable={false}
                      rightIcon="chevron-down-outline"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* STATE DROPDOWN */}
            {showStateDropdown && (
              <View style={{
                backgroundColor: "#FFF",
                borderRadius: 14,
                marginBottom: 20,
                marginTop: -10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                overflow: "hidden"
              }}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {states.map((item) => (
                    <TouchableOpacity
                      key={item.state_id}
                      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
                      onPress={() => {
                        setSelectedStateId(item.state_id);
                        setSelectedStateName(item.state_name);
                        setShowStateDropdown(false);
                      }}
                    >
                      <Text style={{ fontSize: 15, color: "#374151" }}>{item.state_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <FloatingLabelInput label="Land Mark" value={landmark} onChangeText={setLandmark} icon="flag-outline" />

            {/* Submit Button */}
            <TouchableOpacity
              style={{
                height: 56, borderRadius: 14,
                overflow: 'hidden',
                shadowColor: '#1BA9A2', shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                marginTop: 10,
                marginBottom: 20
              }}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1BA9A2', '#0A736F']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 }}>
                    Continue to KYC Documents
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, textAlign: "center", color: "#9CA3AF" }}>
              By Continuing, you agree to our <Text style={{ fontWeight: "700", color: "#1BA9A2" }}>T&C</Text> and{" "}
              <Text style={{ fontWeight: "700", color: "#1BA9A2" }}>Privacy Policy</Text>
            </Text>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* IMAGE SELECTION MODAL */}
      <Modal visible={showImageOptions} transparent animationType="fade">
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }} 
          activeOpacity={1} 
          onPress={() => setShowImageOptions(false)}
        >
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 20, textAlign: "center" }}>Profile Photo</Text>
            
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }} onPress={handleCamera}>
              <Icon name="camera-outline" size={24} color="#374151" />
              <Text style={{ fontSize: 16, color: "#374151", marginLeft: 16, fontWeight: "500" }}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }} onPress={pickImage}>
              <Icon name="image-outline" size={24} color="#374151" />
              <Text style={{ fontSize: 16, color: "#374151", marginLeft: 16, fontWeight: "500" }}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20, paddingVertical: 16, alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12 }} onPress={() => setShowImageOptions(false)}>
              <Text style={{ fontSize: 16, color: "#EF4444", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}
