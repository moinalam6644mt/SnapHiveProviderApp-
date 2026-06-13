import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

export default function VerificationLoginScreen() {
  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={require('../../../assets/app/splashImage/verify.png')}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>Verification in progress</Text>

            <Text style={styles.wait}>Please wait...</Text>

            <Text style={styles.desc}>
              We're processing your verification. The status will be updated within
              24 hours.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
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
    paddingHorizontal: scale(20),
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: scale(24),
    padding: scale(30),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    width: '100%',
  },
  image: {
    width: scale(122),
    height: scale(124),
    marginBottom: scale(24),
  },
  title: {
    fontSize: scale(24),
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: scale(30),
    marginBottom: scale(10),
  },
  wait: {
    fontSize: scale(18),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: scale(12),
  },
  desc: {
    fontSize: scale(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: scale(21),
  },
});
