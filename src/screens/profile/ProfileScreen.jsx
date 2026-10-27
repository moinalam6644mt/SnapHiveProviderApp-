import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
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

import WalletBalance from "../../components/Wallet/WalletBalance";
import QuickActions from "../../components/Profile/QuickActions";
import MenuOptions from "../../components/Profile/MenuOptions";
import LogOutButton from "../../components/Profile/LogOutButton";
import ProfileSkeleton from "../../components/Profile/ProfileSkeleton";

import { AuthUser } from "../../../api/authUser";
import { AuthContext } from "../../context/AuthContext";
import { useAppConfig } from "../../context/AppConfigContext";

import { theme } from '../../styles/globalStyles';
const ProfileScreen = () => {
  const [profile, setGetProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { callApi } = AuthUser();
  const { userId } = useContext(AuthContext);
  const { currentInstalledVersion, support } = useAppConfig();

  const getProfile = async () => {
    try {
      const resp = await callApi({
        api: `/user/worker_profile?worker_id=${userId}`,
        method: "GET",
        data: {}
      })
      setGetProfile(resp?.response?.data?.['profile_det'])
    } catch (error) {
      console.warn(error)
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      getProfile().finally(() => setLoading(false));
    }
  }, [userId]);

  const onRefresh = React.useCallback(() => {
    if (!userId) return;
    setRefreshing(true);
    setLoading(true); // Show skeleton on refresh
    getProfile().finally(() => {
      setRefreshing(false);
      setLoading(false);
    });
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom", "top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#308695"]} tintColor="#308695" />
          }
        >
          <View style={styles.mainContainer}>

            <View style={styles.quickContainer}>
              <View style={styles.userCard}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {profile?.worker_name ? profile.worker_name.charAt(0).toUpperCase() : "W"}
                    </Text>
                  </View>
                </View>
                <View style={styles.userInfoTextContainer}>
                  <Text style={styles.welcomeText}>Welcome, </Text>
                  <Text style={styles.userName} numberOfLines={1}>{profile?.worker_name || "Provider"}</Text>
                  <Text style={styles.phoneText}>+91 {profile?.worker_phone || "N/A"}</Text>
                </View>

                <TouchableOpacity style={styles.editBtn}>
                  <Pencil size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
              <WalletBalance />
            </View>
            <QuickActions />
          </View>

          <MenuOptions />
          <LogOutButton />

          <View style={styles.appFooter}>
            <Text style={styles.appFooterText}>SnapHive Partner • v{currentInstalledVersion}</Text>
            {support?.email && (
              <Text style={styles.appFooterSub}>{support.email}</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  appFooter: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  appFooterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Sora-SemiBold',
  },
  appFooterSub: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 3,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#FFFFFF",
    marginTop: verticalScale(10),
    paddingTop: 0,
    paddingBottom: verticalScale(25),
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(15),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(15),
    marginBottom: verticalScale(10),
    borderWidth: 0.25,
    borderColor: "#308695",
  },
  avatarContainer: {
    marginRight: horizontalScale(15),
  },
  avatarPlaceholder: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: theme.primary || "#134E5E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: moderateScale(24),
    fontWeight: "bold",
    fontFamily: "Sora-Bold",
  },
  userInfoTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: moderateScale(14),
    color: "#64748b",
    fontFamily: "Sora-Regular",
  },
  userName: {
    fontSize: moderateScale(20),
    color: "#1e1b4b",
    fontWeight: "bold",
    fontFamily: "Sora-Bold",
  },
  phoneText: {
    fontSize: moderateScale(14),
    color: "#64748b",
    marginTop: verticalScale(2),
    fontFamily: "Sora-Regular",
  },
  editBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    backgroundColor: "#f8fafc",
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: moderateScale(1),
    borderColor: "#f1f5f9",
  },
});
