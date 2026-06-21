import React, { useEffect, useRef } from 'react';
import { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Award } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[theme.background, theme.backgroundEnd]}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.topCurve} />
      <View style={styles.topCurveOverlay} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <Image
            source={require('../../assets/app/splashLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.iconBadge}>
            <Award color="white" size={32} strokeWidth={2} />
          </View>

          <Text style={styles.trustedText}>
            Trusted By{'\n'}
            <Text style={styles.boldText}>1000+ Professionals</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCurve: {
    width: width * 3,
    height: width * 3,
    borderRadius: (width * 3) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'absolute',
    top: -width * 2.7,
    alignSelf: 'center',
  },
  topCurveOverlay: {
    width: width * 2.5,
    height: width * 2.5,
    borderRadius: (width * 2.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    position: 'absolute',
    top: -width * 2.3,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    width: width * 0.75,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustedText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  boldText: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginTop: 4,
  },
});
