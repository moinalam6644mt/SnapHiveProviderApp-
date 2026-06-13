import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";

const EarningsCards = ({ onPress, todayEarnings }) => (
  <View style={styles.row}>
    <View style={styles.card}>
      <Text style={styles.amount}>₹{todayEarnings ? parseFloat(todayEarnings).toFixed(2) : "0.00"}</Text>
      <Text style={styles.label}>Today’s Earnings</Text>
    </View>
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.seeAllRow}>
        <Text style={styles.label}>See all{"\n"}Earnings</Text>
        <ArrowRight size={20} color="#374151" />
      </View>
    </TouchableOpacity>
  </View>
);

export default EarningsCards;

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 15 },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 90,
    justifyContent: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginBottom: 5,
  },
  label: { fontSize: 13, color: "#3f3f46", fontWeight: "600" },
  seeAllRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
