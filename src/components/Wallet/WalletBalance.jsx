import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { AuthUser } from "../../../api/authUser";

const WalletBalance = ({ walletData }) => {
  const navigation = useNavigation();
  const { userId } = useContext(AuthContext);
  const { callApi } = AuthUser();
  const [balance, setBalance] = useState(walletData?.balance ?? null);
  const [loading, setLoading] = useState(balance === null);

  const fetchBalance = async () => {
    if (!userId) return;
    try {
      const response = await callApi({
        api: `/user/worker_balance?worker_id=${userId}`,
        method: "GET",
        data: {},
      });
      
      if (response?.response?.data?.balance !== undefined) {
        setBalance(response.response.data.balance);
      }
    } catch (error) {
      console.warn("[WalletBalance Auto-Fetch] Error:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  // Run on every screen focus so it's always up to date everywhere
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
  );

  const handleAddMoney = () => {
    // Ensure this screen exists in your navigator
    navigation.navigate("Main",{
      screen:"RechargeScreen"
    });
  };

  const displayBalance = balance !== null ? balance : (walletData?.balance ?? 0);

  return (
    <View style={styles.balanceCard}>
      {/* Background Static Pattern Image */}
      <Image
        source={require("../../../assets/app/wallet/walletBG2.png")}
        style={styles.bgPattern}
        resizeMode="contain"
      />

      <View>
        <Text style={styles.label}>Wallet Balance</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <Text style={[styles.amount, { marginTop: 0 }]}>
            ₹{loading ? "..." : displayBalance}
          </Text>
          {loading && (
            <ActivityIndicator size="small" color="#1e1b4b" style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.addMoneyBtnContainer}
        onPress={handleAddMoney}
      >
        <LinearGradient
          colors={['#134E5E', '#71B280']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addMoneyGradient}
        >
          <Text style={styles.addMoneyText}>Add Money</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default WalletBalance;

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#F2F5F7",
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 10,
  },
  bgPattern: {
    position: "absolute",
    left: 90,
    top: -10,
    width: 150,
    height: 120,
    opacity: 0.1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4b5563",
    fontFamily: "Sora-Bold",
  },
  amount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginTop: 5,
    fontFamily: "Sora-Bold",
  },
  addMoneyBtnContainer: {
    borderRadius: 30,
    shadowColor: '#134E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  addMoneyGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoneyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "Sora-SemiBold",
  },
});
