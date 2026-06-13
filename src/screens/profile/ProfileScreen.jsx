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
import LinearGradient from "react-native-linear-gradient";

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
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

      <View style={styles.header}>
        <ProfileHeader />
      </View>

        <View style={styles.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
          </ScrollView>
        </View>
      </LinearGradient>

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
  },
  gradientBg: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    flex: 1,
    paddingTop: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    marginTop: verticalScale(10),
  },
  scrollContent: {
    paddingBottom: verticalScale(100),
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
    backgroundColor: "#FFFFFF",
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
