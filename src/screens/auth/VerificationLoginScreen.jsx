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
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import sharedStyles from './LoginStyle';

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
    <View style={[sharedStyles.container, { paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight }]}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={['#308695', '#308695']}
        style={sharedStyles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={sharedStyles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* TOP SECTION */}
          <View style={sharedStyles.topSection}>
            <Image
              source={require('../../../assets/images/logo1.png')}
              style={sharedStyles.logo}
            />
            <Text style={sharedStyles.tagline}>Powered by People</Text>
          </View>

          {/* BOTTOM SHEET */}
          <View style={[sharedStyles.bottomSheet, { alignItems: 'center', flex: 1 }]}>
            <View style={localStyles.imageContainer}>
              <Animated.View style={[localStyles.glow, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.Image
                source={require('../../../assets/app/splashImage/verify.png')}
                style={[localStyles.image, { transform: [{ translateY: floatAnim }] }]}
                resizeMode="contain"
              />
            </View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', width: '100%' }}>
              <Text style={sharedStyles.title}>Verification</Text>
              <Text style={[sharedStyles.subtitle, { marginBottom: 20 }]}>in progress</Text>

              <View style={localStyles.badgeContainer}>
                <View style={localStyles.badgeDot} />
                <Text style={localStyles.wait}>Please wait</Text>
              </View>

              <Text style={localStyles.desc}>
                We're processing your verification. The status will be updated within
                24 hours.
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const localStyles = StyleSheet.create({
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
    backgroundColor: 'rgba(48, 134, 149, 0.15)',
    borderRadius: scale(55),
  },
  image: {
    width: scale(120),
    height: scale(120),
    zIndex: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    marginBottom: scale(24),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#4ade80',
    marginRight: scale(8),
  },
  wait: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  desc: {
    fontSize: scale(15),
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: scale(24),
    paddingHorizontal: scale(8),
  },
});
