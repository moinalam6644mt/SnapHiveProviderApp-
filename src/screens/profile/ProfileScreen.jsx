import React, { useState,useEffect,useContext } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;
import { Pencil } from "lucide-react-native";

import ProfileHeader from "../../components/Profile/ProfileHeader";
import WalletBalance from "../../components/Wallet/WalletBalance";
import QuickActions from "../../components/Profile/QuickActions";
import MenuOptions from "../../components/Profile/MenuOptions";
import LogOutButton from "../../components/Profile/LogOutButton";
import WalletHistoryDrawer from "../../components/Profile/Transaction/WalletHistoryDrawer";
import { AuthUser } from "../../../api/authUser";
import { AuthContext } from "../../context/AuthContext";

import { theme } from '../../styles/globalStyles';
const ProfileScreen = () => {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [profile,setGetProfile]  = useState({});
  const {callApi}=  AuthUser();
  const {userId} = useContext(AuthContext);
  // console.log(userId,'userId')

  const getProfile = async () => {
    try {
      const resp = await callApi({
      api:`/user/worker_profile?worker_id=${userId}`,
      method:"GET",
      data:{}
    })
    // console.log(resp?.response?.data?.['profile_det'],'resp')
    setGetProfile(resp?.response?.data?.['profile_det'])
    } catch (error) {
      console.warn(error)
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", ]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.header}>
        <ProfileHeader />
      </View>

      <View>
        <View style={styles.mainContainer}>
          <WalletBalance />
        </View>

        {/* User Info Section with Edit Button */}
        <View style={styles.quickContainer}>
          <View style={styles.userSection}>
            <View style={styles.userInfoRow}>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.welcomeText}>Welcome, </Text>
                  <Text style={styles.userName}>{profile?.worker_name}</Text>
                  {/* <View style={styles.verifiedCheck} /> */}
                </View>
                <Text style={styles.phoneText}>+91 {profile?.worker_phone}</Text>
              </View>

              {/* <TouchableOpacity style={styles.editBtn}>
                <Pencil size={20} color="#71717a" />
              </TouchableOpacity> */}
            </View>
          </View>

          <QuickActions onOpenHistory={() => setHistoryVisible(true)} />
        </View>

        <MenuOptions />
        <LogOutButton />
      </View>

      <WalletHistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingVertical: verticalScale(20),
  },
  header: {
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(10),
  },
  mainContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  quickContainer: {
    paddingHorizontal: horizontalScale(20),
    backgroundColor: "#f8f9fa",
    marginTop: verticalScale(10),
    paddingTop: 0,
    paddingBottom: verticalScale(25),
  },
  userSection: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: moderateScale(18),
    color: "#1e1b4b",
    fontWeight: "bold",
    fontFamily: "Sora-Bold",
  },
  userName: {
    fontSize: moderateScale(18),
    color: "#1e1b4b",
    fontFamily: "Poppins-Regular",
  },
  verifiedCheck: {
    width: moderateScale(10),
    height: moderateScale(10),
    backgroundColor: "#22c55e",
    borderRadius: moderateScale(9),
    marginLeft: horizontalScale(2),
  },
  phoneText: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1e1b4b",
    marginTop: verticalScale(4),
    fontFamily: "Sora-Bold",
  },
  editBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    backgroundColor: "white",
    borderRadius: moderateScale(22),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: moderateScale(1),
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(2),
  },
});
