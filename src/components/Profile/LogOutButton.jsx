import React from 'react';
import { useContext } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

import { theme } from '../../styles/globalStyles';

const LogOutButton = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.buttonContainer,
        pressed && styles.buttonPressed
      ]}
      onPress={handleLogout}
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
});

export default LogOutButton;
