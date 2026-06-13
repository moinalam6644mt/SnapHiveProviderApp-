import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const WebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { url, title } = route.params || {};

  const [loading, setLoading] = useState(true);

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>No URL Provided</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>{title || "Web Page"}</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Loader */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#ff7a00" />
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: url }}
        onLoadEnd={() => setLoading(false)}
      />
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  loader: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});