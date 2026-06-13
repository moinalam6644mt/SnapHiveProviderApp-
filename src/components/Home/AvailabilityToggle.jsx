import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

const AvailabilityToggle = ({ isAvailable, onToggle }) => {
  const [toggling, setToggling] = useState(false);

  const handlePress = async (available) => {
    if (toggling || available === isAvailable) return; // no-op if same state
    setToggling(true);
    try {
      await onToggle(available);
    } finally {
      setToggling(false);
    }
  };

  return (
    <View style={styles.toggleWrapper}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => handlePress(true)}
          style={[styles.btn, isAvailable && styles.activeBtn]}
          activeOpacity={0.8}
          disabled={toggling}
        >
          {toggling && isAvailable ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.text, isAvailable && styles.activeText]}>
              Available
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress(false)}
          style={[styles.btn, !isAvailable && styles.inactiveBtn]}
          activeOpacity={0.8}
          disabled={toggling}
        >
          {toggling && !isAvailable ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.text, !isAvailable && styles.activeText]}>
              Not Available
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AvailabilityToggle;

const styles = StyleSheet.create({
  toggleWrapper: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 30,
    padding: 5,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  activeBtn: {
    backgroundColor: "#2E2E74",
  },
  inactiveBtn: {
    backgroundColor: "#EF4444",
  },
  text: {
    color: "#1e1b4b",
    fontWeight: "600",
  },
  activeText: {
    color: "white",
  },
});

