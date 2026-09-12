import React, { useContext, useState } from 'react';
import { Pressable, Text, StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { LogOut, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

import { theme } from '../../styles/globalStyles';

const LogOutButton = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogoutClick = () => {
    setModalVisible(true);
  };

  const confirmLogout = () => {
    setModalVisible(false);
    logout();
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.buttonContainer,
          pressed && styles.buttonPressed
        ]}
        onPress={handleLogoutClick}
      >
        <View style={styles.buttonContent}>
          <LogOut
            size={20}
            color="#ef4444"
            style={styles.icon}
          />
          <Text style={styles.text}>
            Log Out
          </Text>
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <LogOut size={24} color="#ef4444" />
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out of your account? You will need to verify your phone number again to log back in.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 30,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: '#fee2e2',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Sora-SemiBold',
    fontSize: 16,
    color: '#ef4444',
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontFamily: 'Sora-Bold',
    fontSize: 22,
    color: '#0f172a',
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: 'Sora-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Sora-SemiBold',
    fontSize: 15,
    color: '#475569',
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: 'Sora-SemiBold',
    fontSize: 15,
    color: 'white',
  },
});

export default LogOutButton;
