import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ReceiptText } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const QuickActions = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.grid}>
      <TouchableOpacity
        style={styles.box}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("WalletHistoryScreen")}
      >
        <View style={styles.iconWrapper}>
          <ReceiptText size={24} color="#308695" />
        </View>
        <Text style={styles.boxText}>Transaction History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    marginTop: 5,
  },
  box: {
    width: "100%",
    backgroundColor: "#308695",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.25,
    borderColor: "#308695",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  boxText: {
    fontSize: 16,
    color: "#ffffff",
    fontFamily: "Sora-SemiBold",
  },
});

export default QuickActions;
