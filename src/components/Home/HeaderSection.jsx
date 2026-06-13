import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HeaderSection = ({ userName,joiningDate }) => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(',', '');
  };

useEffect(() => {
  const updateGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else if (hour >= 17 && hour < 20) {
      setGreeting('Good Evening');
    } else {
      setGreeting('Good Night');
    }
  };

  updateGreeting(); // first time run

  const interval = setInterval(updateGreeting, 60000); // every 1 min

  return () => clearInterval(interval);
}, []);

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <Image
        source={require('../../../assets/app/home/header.png')}
        style={styles.centerLogo}
        resizeMode="contain"
      />

      <View style={styles.headerTop}>
        <View style={styles.welcomeContainer}>
          <View style={styles.verticalLine} />
          <View>
            <Text style={styles.helloText}>Hello, {userName}</Text>
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.walletCircle}
          onPress={() =>
            navigation.navigate('Main', {
              screen: 'Wallet',
            })
          }
        >
          <Wallet size={20} color="#1e1b4b" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <Text style={styles.joinDateText}>Joined On : {formatDate(joiningDate)}</Text>
    </View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2E2E74',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 22,
    position: 'relative',
    zIndex: 999,
  },

  centerLogo: {
    position: 'absolute',
    width: 75,
    height: 86,
    alignSelf: 'center',
    top: 80,
    opacity: 1,
    zIndex: 0,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    zIndex: 1,
  },

  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verticalLine: {
    width: 3,
    height: 32,
    backgroundColor: 'white',
    marginRight: 10,
    borderRadius: 2,
  },

  helloText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },

  greetingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  walletCircle: {
    width: 42,
    height: 42,
    backgroundColor: 'white',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  joinDateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 15,
    marginLeft: 13,
    zIndex: 1,
  },
});
