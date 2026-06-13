import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const MenuOptions = () => {
  const navigation = useNavigation();
  const menuItems = [
    {id:1,title:"Help & Support",url:"https://maidfort.com/contact-us"},
    {id:2,title:"Privacy Policy",url:"https://maidfort.com/privacy-policy"},
    {id:3,title:"Refund & cancellation Policy",url:"https://maidfort.com/refund-policy"},
    {id:4,title:"Report Issue",url:"https://maidfort.com/contact-us"},
  ];

  const handleMenuItemPress = (item) => {
    navigation.navigate("WebViewScreen", {
        url: item.url,
        title: item.title,
      });
    };


  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => handleMenuItemPress(item)}>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>{item.title}</Text>
          </View>
          {index < menuItems.length - 1 && <View style={styles.divider} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  menuItem: { paddingVertical: 18 },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Sora-SemiBold",
  },
  divider: { height: 1, backgroundColor: "#e5e7eb" },
});

export default MenuOptions;
