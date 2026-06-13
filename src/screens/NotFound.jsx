import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Construction } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { theme } from '../styles/globalStyles';
const { width } = Dimensions.get("window");

const NotFound = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#1e1b4b" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Construction size={60} color="#f97316" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Feature Not Found</Text>

        <Text style={styles.description}>
          These features are currently not implemented.
          {"\n"}
          Please check other sections for now.
        </Text>

        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e1b4b",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },

  goBackBtn: {
    backgroundColor: "#1e1b4b",
    width: width * 0.6,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
