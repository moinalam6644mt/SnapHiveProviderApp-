// src/components/Profile/MenuOptions.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  LifeBuoy,
  Shield,
  FileText,
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  X,
  FileCheck2,
} from "lucide-react-native";
import { useAppConfig } from "../../context/AppConfigContext";

const MenuOptions = () => {
  const navigation = useNavigation();
  const { urls, support, openSupportPhone, openSupportWhatsApp } = useAppConfig();
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const menuItems = [
    {
      id: 1,
      title: "Help & Support",
      action: () => setSupportModalVisible(true),
      icon: LifeBuoy,
      color: "#3b82f6",
    },
    {
      id: 2,
      title: "Privacy Policy",
      url: urls?.privacy_policy_url || "https://snaphive.online/privacy-policy",
      icon: Shield,
      color: "#10b981",
    },
    {
      id: 3,
      title: "Terms & Conditions",
      url: urls?.terms_conditions_url || "https://snaphive.online/terms-and-conditions",
      icon: FileCheck2,
      color: "#6366f1",
    },
    {
      id: 4,
      title: "Refund & Cancellation Policy",
      url: urls?.refund_policy_url || "https://snaphive.online/refund-policy",
      icon: FileText,
      color: "#8b5cf6",
    },
    {
      id: 5,
      title: "Report Issue",
      url: urls?.contact_us_url || "https://snaphive.online/contact-us",
      icon: AlertTriangle,
      color: "#f59e0b",
    },
  ];

  const handleMenuItemPress = (item) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.url) {
      navigation.navigate("WebViewScreen", {
        url: item.url,
        title: item.title,
      });
    }
  };

  return (
    <>
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

      {/* Support Drawer / Action Modal */}
      <Modal
        visible={supportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSupportModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Partner Help & Support</Text>
                    <Text style={styles.modalSubtitle}>
                      Active {support?.timing || "Mon - Sat: 9:00 AM - 8:00 PM"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSupportModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Call Button */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSupportModalVisible(false);
                    openSupportPhone();
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#e0f2fe" }]}>
                    <PhoneCall size={22} color="#0284c7" />
                  </View>
                  <View style={styles.actionTextBox}>
                    <Text style={styles.actionTitle}>Call Helpline</Text>
                    <Text style={styles.actionSub}>{support?.phone || "+91 9333772433"}</Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* WhatsApp Button */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSupportModalVisible(false);
                    openSupportWhatsApp();
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#dcfce7" }]}>
                    <MessageCircle size={22} color="#16a34a" />
                  </View>
                  <View style={styles.actionTextBox}>
                    <Text style={styles.actionTitle}>WhatsApp Support</Text>
                    <Text style={styles.actionSub}>Quick chat with SnapHive team</Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Web Helpdesk */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSupportModalVisible(false);
                    navigation.navigate("WebViewScreen", {
                      url: urls?.help_url || urls?.contact_us_url || "https://snaphive.online/help",
                      title: "SnapHive Help Center",
                    });
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#f3e8ff" }]}>
                    <ExternalLink size={22} color="#9333ea" />
                  </View>
                  <View style={styles.actionTextBox}>
                    <Text style={styles.actionTitle}>Visit Help Center</Text>
                    <Text style={styles.actionSub}>FAQs & Service Guidelines</Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    paddingVertical: 15,
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

  /* Support Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Sora-Bold",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: "Sora-SemiBold",
    color: "#0f172a",
  },
  actionSub: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#64748b",
    marginTop: 2,
  },
});

export default MenuOptions;
