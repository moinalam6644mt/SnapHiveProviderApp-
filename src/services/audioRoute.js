import {NativeModules, Platform} from 'react-native';

const {AudioRoute} = NativeModules;

/**
 * Routes audio to the earpiece (low, near-ear, like a real phone call).
 * Uses Android 12+ setCommunicationDevice API — works for ALL audio including WebView.
 */
export const routeToEarpiece = async () => {
  if (Platform.OS === 'android' && AudioRoute) {
    try {
      await AudioRoute.routeToEarpiece();
    } catch (e) {
      console.warn('routeToEarpiece error:', e);
    }
  }
};

/**
 * Routes audio to the loudspeaker (full volume, hands-free).
 */
export const routeToSpeaker = async () => {
  if (Platform.OS === 'android' && AudioRoute) {
    try {
      await AudioRoute.routeToSpeaker();
    } catch (e) {
      console.warn('routeToSpeaker error:', e);
    }
  }
};

/**
 * Resets audio to system default. Call when call ends.
 */
export const resetAudio = async () => {
  if (Platform.OS === 'android' && AudioRoute) {
    try {
      await AudioRoute.resetAudio();
    } catch (e) {
      console.warn('resetAudio error:', e);
    }
  }
};
