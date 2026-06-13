import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  BackHandler,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthUser } from "../../../api/authUser";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;

export default function VerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { callApi } = AuthUser();

  const { finalData } = route.params || {};

  console.log(finalData)

  useEffect(() => {
    submitFinalData();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  const submitFinalData = async () => {
  try {
    if (!finalData) {
      Toast.show({
        type: "error",
        text1: "No Data Found",
      });

      navigation.navigate("CompleteProfile");
      return;
    }

    const parsedData = JSON.parse(finalData);

    let apiPayload = {
      ...parsedData,
      worker_address: parsedData.address,
      worker_city: parsedData.city,
      worker_state: parsedData.state_id,
      worker_pincode: parsedData.postal_code,
      worker_landmark: parsedData.landmark,
      lat: parsedData.lat,
      lng: parsedData.lng,
    };

    // PHP handles service_id[0], service_id[1] exactly the same as service_id[]
    if (Array.isArray(parsedData.service_id)) {
      parsedData.service_id.forEach((id, index) => {
        apiPayload[`service_id[${index}]`] = id;
      });
    }

    if (Array.isArray(parsedData.service_name)) {
      parsedData.service_name.forEach((name, index) => {
        apiPayload[`service_name[${index}]`] = name;
      });
    }

  console.log(apiPayload)

    const response = await callApi({
      api: "/signupPro",
      method: "CUSTOM_POST",
      data: apiPayload,
    });


    if (response?.status === 1) {
  const userName = response?.response?.name || "User";

  Toast.show({
    type: "success",
    text1: `Profile setup successfully, ${userName}`,
    text2: "Please Waiting for Verification",
  });

  // setTimeout(() => {
  //   navigation.navigate("Auth", {
  //     screen: "Login",
  //   });
  // }, 1500);
}
 else {
      Toast.show({
        type: "error",
        text1:
          response?.response?.errors?.[0]?.message ||
          "Registration Failed",
      });

      setTimeout(() => {
        navigation.navigate("CompleteProfile", {
          userData: finalData,
        });
      }, 1500);
    }
  } catch (error) {

    Toast.show({
      type: "error",
      text1: "Something went wrong",
    });

    setTimeout(() => {
      navigation.navigate("CompleteProfile", {
        userData: finalData,
      });
    }, 1500);
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
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={require("../../../assets/app/splashImage/verify.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>Verification in progress</Text>

            <Text style={styles.wait}>Please wait...</Text>

            <Text style={styles.desc}>
              We're processing your verification. The status will be updated
              within 24 hours.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: scale(24),
    padding: scale(30),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    width: '100%',
  },
  image: {
    width: scale(122),
    height: scale(124),
    marginBottom: scale(24),
  },
  title: {
    fontSize: scale(24),
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: scale(30),
    marginBottom: scale(10),
  },
  wait: {
    fontSize: scale(18),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: scale(12),
  },
  desc: {
    fontSize: scale(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: scale(21),
  },
});
