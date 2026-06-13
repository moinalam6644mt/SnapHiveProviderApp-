import React from 'react';
import { useContext } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

const LogOutButton = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonActive : styles.buttonInactive,
      ]}
      onPress={handleLogout}
    >
      {({ pressed }) => (
        <>
          <Text style={[styles.text, pressed && styles.textActive]}>
            Log Out
          </Text>
          <LogOut
            size={20}
            color={pressed ? 'white' : '#ef4444'}
            style={styles.icon}
          />
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 30,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Default Style
  buttonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#fee2e2',
  },

  // Pressed Style
  buttonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },

  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ef4444',
  },

  textActive: {
    color: 'white',
  },

  icon: {
    marginLeft: 10,
  },
});

export default LogOutButton;
