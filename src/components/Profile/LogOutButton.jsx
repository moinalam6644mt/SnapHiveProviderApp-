import React from 'react';
import { useContext } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import LinearGradient from "react-native-linear-gradient";

import { theme } from '../../styles/globalStyles';
const LogOutButton = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <Pressable
      style={styles.buttonContainer}
      onPress={handleLogout}
    >
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.text}>
          Log Out
        </Text>
        <LogOut
          size={20}
          color="#FFFFFF"
          style={styles.icon}
        />
      </LinearGradient>
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
    shadowColor: '#134E5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  icon: {
    marginLeft: 10,
  },
});

export default LogOutButton;
