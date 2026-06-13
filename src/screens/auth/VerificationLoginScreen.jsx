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

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />

      <View style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  image: {
    width: 122,
    height: 124,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E2E74',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 6,
  },

  wait: {
    fontSize: 18,
    fontWeight: '700',
    color: '#474747',
    textAlign: 'center',
    marginBottom: 10,
  },

  desc: {
    fontSize: 14,
    fontWeight: '400',
    color: '#474747',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: width - 40,
  },
});
