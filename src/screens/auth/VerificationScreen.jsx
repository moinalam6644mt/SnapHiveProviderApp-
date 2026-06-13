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

const { width } = Dimensions.get("window");

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
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />

      <View style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  image: {
    width: 122,
    height: 124,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E2E74",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 6,
  },

  wait: {
    fontSize: 18,
    fontWeight: "700",
    color: "#474747",
    textAlign: "center",
    marginBottom: 10,
  },

  desc: {
    fontSize: 14,
    fontWeight: "400",
    color: "#474747",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: width - 40,
  },
});
