import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Home,
  Briefcase,
  Bell,
  User,
  MessageCircle,
  WalletCards,
} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from '../../styles/globalStyles';
const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const currentRoute = route.name;

  const handleNavigation = screen => {
    navigation.navigate('Main', {
      screen: screen,
    });
  };

  return (
    <LinearGradient 
      colors={['#134E5E', '#71B280']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.footer}
    >
      <FooterItem
        label="Home"
        active={currentRoute === 'Home'}
        IconComponent={Home}
        onPress={() => handleNavigation('HomeMain')}
      />

      <FooterItem
        label="Jobs"
        active={currentRoute === 'Jobs'}
        IconComponent={Briefcase}
        onPress={() => handleNavigation('JobScreen')}
      />

      <FooterItem
        label="Wallet"
        active={currentRoute === 'Wallet'}
        IconComponent={WalletCards}
        onPress={() => handleNavigation('Wallet')}
      />

      <FooterItem
        label="Account"
        active={currentRoute === 'Profile'}
        IconComponent={User}
        onPress={() => handleNavigation('Profile')}
      />
    </LinearGradient>
  );
};

const FooterItem = ({label, active, IconComponent, onPress}) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.6}>
    <IconComponent
      size={24}
      color={active ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
      strokeWidth={active ? 2.5 : 1.8}
    />
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
);

export default Footer;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    height: 75,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 10,

    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontFamily: 'Sora-Regular',
  },

  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
