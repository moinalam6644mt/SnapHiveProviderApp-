import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { theme } from '../../styles/globalStyles';
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
          style={[styles.btn, isAvailable && styles.activeBtnWrapper]}
          activeOpacity={0.8}
          disabled={toggling}
        >
          {isAvailable ? (
            <LinearGradient
              colors={['#134E5E', '#71B280']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}
            >
              {toggling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.text, styles.activeText]}>
                  Available
                </Text>
              )}
            </LinearGradient>
          ) : (
            <Text style={styles.text}>
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    overflow: 'hidden',
    height: 44,
  },
  activeBtnWrapper: {
    padding: 0,
  },
  gradientBtn: {
    flex: 1,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  inactiveBtn: {
    backgroundColor: theme.danger,
  },
  text: {
    color: "#1e1b4b",
    fontWeight: "600",
  },
  activeText: {
    color: "white",
  },
});

