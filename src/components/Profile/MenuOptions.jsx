import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LifeBuoy, Shield, FileText, AlertTriangle, ChevronRight } from "lucide-react-native";

const MenuOptions = () => {
  const navigation = useNavigation();
  const menuItems = [
    { id: 1, title: "Help & Support", url: "https://maidfort.com/contact-us", icon: LifeBuoy, color: "#3b82f6" },
    { id: 2, title: "Privacy Policy", url: "https://maidfort.com/privacy-policy", icon: Shield, color: "#10b981" },
    { id: 3, title: "Refund & Cancellation Policy", url: "https://maidfort.com/refund-policy", icon: FileText, color: "#8b5cf6" },
    { id: 4, title: "Report Issue", url: "https://maidfort.com/contact-us", icon: AlertTriangle, color: "#f59e0b" },
  ];

  const handleMenuItemPress = (item) => {
    navigation.navigate("WebViewScreen", {
      url: item.url,
      title: item.title,
    });
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => handleMenuItemPress(item)}
          >
            <View style={styles.menuItem}>
              <View style={styles.iconAndText}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </View>
            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 0.25,
    borderColor: "#308695",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Sora-SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 50,
  },
});

export default MenuOptions;
