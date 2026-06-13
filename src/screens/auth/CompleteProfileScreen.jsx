import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
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
  ActivityIndicator
} from "react-native";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import ImagePicker from "react-native-image-crop-picker";
import { AuthUser } from "../../../api/authUser";
import Toast from "react-native-toast-message";
import { ArrowLeft, User, Pencil, ChevronDown, Camera, Image as ImageIcon, Check, MapPin, Navigation } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from '../../styles/globalStyles';
const { width, height } = Dimensions.get("window");
// Simple responsive scaling function
const scale = (size) => (width / 375) * size;

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
  }, []);

  const fetchListData = async () => {
    try {
      const response = await callApi({
        api: "/signForm",
        method: "GET",
      });

      console.log(response)

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

  /* ============= GEOLOCATION & ADDRESS FILL ============= */

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

    console.log("Enter for get Current Location")

    if (Platform.OS === 'android') {
      try {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        console.log("Access result: ",result)
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
        console.log("Enter for get Current Location 1")
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        console.log("Enter for get Current Location 2")

        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
          const response = await axios.get(url);
          console.log("Enter for get Current Location 3")
          console.log(response);

          if (response.data.status === 'OK' && response.data.results.length > 0) {
            console.log("Enter for get Current Location 4")
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

  const handleSubmit = () => {
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

    const parsedData = JSON.parse(userData);

    const finalPayload = {
      ...parsedData,
      step: "2",
      service_id: selectedServices.map((s) => s.category_subchild_id),
      service_name: selectedServices.map((s) => s.category_subchild_name),
      state_id: selectedStateId,
      state_name: selectedStateName,
      address,
      worker_flat: houseNo,
      worker_street:street,
      city,
      postal_code: postalCode,
      landmark,
      lat: latitude,
      lng: longitude,
      logo: profileImage || null,
    };

    Toast.show({
      type: "success",
      text1: "Processing...",
    });

    setTimeout(() => {
      navigation.navigate("Verification", {
        finalData: JSON.stringify(finalPayload),
      });
    }, 800);
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar
          barStyle="dark-content"
          translucent={true}
          backgroundColor="transparent"
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft name="arrow-back" size={24} color="#000" fontWeight={900} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Complete your account</Text>
        </View>

        <View style={styles.profileWrapper}>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.iconPlaceholder}>
                <User  name="person" size={50} color="#ccc" />
              </View>
            )}
          </View>

          <Pressable style={styles.editIcon} onPress={() => setShowImageOptions(true)}>
            <Pencil name="pencil" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* SERVICE DROPDOWN */}
        <Pressable
          style={styles.inputBox}
          onPress={() => setShowServiceDropdown(!showServiceDropdown)}
        >
          <View style={styles.dropdownTrigger}>
            <Text style={[styles.inputText, { flex: 1, paddingRight: 10 }]} numberOfLines={1}>
              {selectedServices.length > 0
                ? selectedServices.map((s) => s.category_subchild_name).join(", ")
                : "Select Service Category"}
            </Text>
            <ChevronDown name="chevron-down" size={22} color="#555" />
          </View>
        </Pressable>

        {showServiceDropdown && (
        <View style={styles.dropdown}>
          <ScrollView
            style={{ maxHeight: scale(55 * 3) }} // approx 3 items height
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
              {services.map((item) => {
                const isSelected = selectedServices.some(
                  (s) => s.category_subchild_id === item.category_subchild_id
                );
                return (
                  <Pressable
                    key={item.category_subchild_id}
                    style={[
                      styles.dropdownItem,
                      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedServices(
                          selectedServices.filter(
                            (s) => s.category_subchild_id !== item.category_subchild_id
                          )
                        );
                      } else {
                        setSelectedServices([...selectedServices, item]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        isSelected && { color: "#f57c00", fontWeight: "bold" },
                      ]}
                    >
                      {item.category_subchild_name}
                    </Text>
                    {isSelected && <Check size={18} color="#f57c00" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Text style={styles.fieldLabelInline}>Search Location</Text>
        <View style={{ position: "relative", zIndex: 999 }}>
          <View style={styles.mapSearchBoxInline}>
            <TextInput 
              placeholder="Search for area, street, landmark..."
              placeholderTextColor="#888"
              style={styles.mapSearchInput}
              value={mapSearchText}
              onChangeText={handlePlaceSearch}
            />
          </View>

          {predictions.length > 0 && (
            <View style={styles.predictionsDropdown}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {predictions.map((p) => (
                  <TouchableOpacity
                    key={p.place_id}
                    style={styles.predictionItem}
                    onPress={() => handleSelectPlace(p.place_id, p.description)}
                  >
                    <Text style={styles.predictionText}>{p.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.currentLocBtn} 
          onPress={getCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color="#ED6E0A" size="small" />
          ) : (
            <>
              <Navigation size={18} color="#ED6E0A" />
              <Text style={styles.currentLocBtnText}>Use Current Location</Text>
            </>
          )}
        </TouchableOpacity>

        {coordError ? (
          <View style={styles.coordErrorBox}>
            <Text style={styles.coordErrorText}>Coordinates required - Please search or use current location</Text>
          </View>
        ) : latitude && longitude ? (
          <View style={styles.coordSuccessBox}>
            <MapPin size={16} color="#4ade80" />
            <Text style={styles.coordSuccessText}>Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabelInline}>Address*</Text>
        <Input placeholder="Address" value={address} onChangeText={setAddress} />
        
        <Text style={styles.fieldLabelInline}>House / Flat No.*</Text>
        <Input placeholder="House / Flat No." value={houseNo} onChangeText={setHouseNo} />
        
        <Text style={styles.fieldLabelInline}>Locality</Text>
        <Input placeholder="Sector F" value={street} onChangeText={setStreet} />
        
        <Text style={styles.fieldLabelInline}>City</Text>
        <Input placeholder="Kolkata" value={city} onChangeText={setCity} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabelInline}>PIN Code</Text>
            <Input
              placeholder="700107"
              value={postalCode}
              onChangeText={setPostalCode}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabelInline}>State</Text>
            <Pressable
              style={styles.inputBox}
              onPress={() => setShowStateDropdown(!showStateDropdown)}
            >
              <View style={styles.dropdownTrigger}>
                <Text style={styles.inputText}>
                  {selectedStateName || "State"}
                </Text>
                <ChevronDown name="chevron-down" size={20} color="#555" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* STATE DROPDOWN */}
        {showStateDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={{ maxHeight: 200 }}>
              {states.map((item) => (
                <Pressable
                  key={item.state_id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStateId(item.state_id);
                    setSelectedStateName(item.state_name);
                    setShowStateDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {item.state_name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <Input
          placeholder="Land Mark"
          value={landmark}
          onChangeText={setLandmark}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By Continuing, you agree to our <Text style={styles.link}>T&C</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
        </ScrollView>
      </KeyboardAvoidingView>

        {/* IMAGE SELECTION MODAL */}
        <Modal visible={showImageOptions} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowImageOptions(false)}
          >
            <View style={styles.imageActionSheet}>
              <Text style={styles.actionSheetTitle}>Profile Photo</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleCamera}>
                <Camera size={24} color="#000" />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <ImageIcon size={24} color="#000" />
                <Text style={styles.actionButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCancelButton} onPress={() => setShowImageOptions(false)}>
                <Text style={styles.actionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>



    </SafeAreaView>
  );
}

/* ===== REUSABLE INPUT ===== */
const Input = ({ style, ...props }) => (
  <View style={[styles.inputBox, style]}>
    <TextInput
      {...props}
      placeholderTextColor="#888"
      style={styles.textInputStyle}
    />
  </View>
);



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: scale(40)
  },
  headerText: { fontSize: scale(20), fontWeight: "700", color:"#000", marginLeft: scale(20) },
  profileWrapper: { alignSelf: "center", marginVertical: scale(10) },
  imageContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: "#f2f2f2",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },inputText:{color:"#000", fontSize: scale(15)},
  profileImage: { width: "100%", height: "100%" },
  iconPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f57c00",
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  inputBox: {
    backgroundColor: "#f4f4f4",
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    height: scale(55),
    justifyContent: "center",
    marginBottom: scale(15),
    color:"#000"
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#f4f4f4",
    borderRadius: scale(15),
    marginBottom: scale(15),
    overflow: "hidden",
    zIndex: 999,
    color:"#000"
  },
  dropdownItem: {
    padding: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    color:"#000"
  },
  dropdownText: { fontSize: scale(15),color:"#000" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: scale(10), marginBottom: scale(15) },
  textInputStyle: { fontSize: scale(15),color:"#000" },
  button: {
    backgroundColor: "#f57c00",
    height: scale(55),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(40),
  },
  buttonText: { color: "#fff", fontSize: scale(16), fontWeight: "700" },
  footer: { fontSize: scale(12), textAlign: "center", 
    marginTop: scale(20)
   },
  link: { fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  imageActionSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    padding: scale(20),
    paddingBottom: scale(40),
  },
  actionSheetTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#000",
    marginBottom: scale(20),
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButtonText: {
    fontSize: scale(16),
    color: "#000",
    marginLeft: scale(15),
  },
  actionCancelButton: {
    marginTop: scale(15),
    paddingVertical: scale(15),
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: scale(10),
  },
  actionCancelText: {
    fontSize: scale(16),
    color: "red",
    fontWeight: "bold",
  },
  
  // INLINE LOCATION SEARCH
  fieldLabelInline: {
    fontSize: scale(14),
    color: "#333",
    fontWeight: "600",
    marginBottom: scale(8),
    marginTop: scale(5),
  },
  mapSearchBoxInline: {
    backgroundColor: "#f4f4f4",
    borderRadius: scale(10),
    paddingHorizontal: scale(15),
    height: scale(50),
    justifyContent: "center",
  },
  mapSearchInput: {
    color: "#000",
    fontSize: scale(14),
  },
  predictionsDropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: scale(10),
    maxHeight: scale(180),
    position: "absolute",
    top: scale(60),
    left: scale(20),
    right: scale(20),
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  predictionItem: {
    padding: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  predictionText: {
    fontSize: scale(14),
    color: "#000",
  },
  currentLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ED6E0A",
    borderStyle: "dashed",
    borderRadius: scale(10),
    height: scale(50),
    marginTop: scale(20),
    marginBottom: scale(15),
    gap: scale(10),
  },
  currentLocBtnText: {
    fontSize: scale(15),
    color: "#ED6E0A",
    fontWeight: "700"
  },
  coordErrorBox: {
    backgroundColor: "#fef3c7",
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(15),
    alignItems: "center"
  },
  coordErrorText: {
    color: "#d97706",
    fontSize: scale(13)
  },
  coordSuccessBox: {
    backgroundColor: "#dcfce7",
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(15),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8)
  },
  coordSuccessText: {
    color: "#166534",
    fontSize: scale(13),
    fontWeight: "600"
  }
});

