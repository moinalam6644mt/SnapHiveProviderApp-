import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const WalletSection = () => {
  return (
    <View style={styles.walletCard}>
      <View>
        <Text style={styles.walletLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>₹1,440</Text>
      </View>

      <TouchableOpacity style={styles.addMoneyBtn}>
        <Text style={styles.addMoneyText}>Add Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  walletCard: {
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Sora-Bold",
  },
  balanceAmount: {
    color: "#1e1b4b",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
    fontFamily: "Sora-Bold",
  },
  addMoneyBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addMoneyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default WalletSection;
