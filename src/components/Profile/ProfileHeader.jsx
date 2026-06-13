import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { ChevronLeft, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const ProfileHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Image
          source={require("../../../assets/images/logo1.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>
      {/* <TouchableOpacity style={styles.notifBtn}>
        <Bell size={24} color="#71717a" />
        <View style={styles.notifDot} />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0, // Main screen padding handle korbe
    paddingVertical: 15,
    alignItems: "center",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { paddingRight: 10 },
  logoImg: { width: 170, height: 55, tintColor: '#FFFFFF' },
  notifBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#f4f4f5",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    backgroundColor: "#f97316",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default ProfileHeader;
