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
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/globalStyles';

const HeaderSection = ({ userName, joiningDate, profileImage }) => {
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
    <View
      style={styles.headerContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />



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
              screen: 'Profile',
            })
          }
        >
          {profileImage ? (
             <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
             <Text style={styles.avatarText}>
               {userName ? userName.charAt(0).toUpperCase() : "U"}
             </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.joinDateText}>Joined On : {formatDate(joiningDate)}</Text>
    </View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 22,
    backgroundColor: theme.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  centerLogo: {
    position: 'absolute',
    width: 75,
    height: 86,
    alignSelf: 'center',
    top: 60,
    opacity: 0.8,
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
    backgroundColor: '#f8fafc',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.25,
    borderColor: '#308695',
  },

  joinDateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 15,
    marginLeft: 13,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: theme.primary,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Sora-Bold",
  },
});
