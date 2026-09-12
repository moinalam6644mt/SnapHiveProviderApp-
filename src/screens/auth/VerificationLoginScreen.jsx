import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

export default function VerificationLoginScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse for the background glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for the image
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Initial fade in and slide up for text
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, [fadeAnim, floatAnim, pulseAnim, slideAnim]);

  return (
    <View style={[styles.safe, { paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight }]}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Top decorative gradient inside card */}
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'transparent']}
              style={styles.cardTopHighlight}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <View style={styles.imageContainer}>
              <Animated.View style={[styles.glow, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.Image
                source={require('../../../assets/app/splashImage/verify.png')}
                style={[styles.image, { transform: [{ translateY: floatAnim }] }]}
                resizeMode="contain"
              />
            </View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
              <Text style={styles.title}>Verification{'\n'}in progress</Text>

              <View style={styles.badgeContainer}>
                <View style={styles.badgeDot} />
                <Text style={styles.wait}>Please wait</Text>
              </View>

              <Text style={styles.desc}>
                We're processing your verification. The status will be updated within
                24 hours.
              </Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: scale(32),
    padding: scale(32),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
    elevation: 10,
    width: '100%',
    overflow: 'hidden',
  },
  cardTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(60),
    opacity: 0.7,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(32),
    marginTop: scale(16),
  },
  glow: {
    position: 'absolute',
    width: scale(110),
    height: scale(110),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: scale(55),
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  image: {
    width: scale(120),
    height: scale(120),
    zIndex: 2,
  },
  title: {
    fontSize: scale(28),
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: scale(36),
    marginBottom: scale(20),
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    marginBottom: scale(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#4ade80',
    marginRight: scale(8),
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  wait: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  desc: {
    fontSize: scale(15),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: scale(24),
    paddingHorizontal: scale(8),
  },
});
