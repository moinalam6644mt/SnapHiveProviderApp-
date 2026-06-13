import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from '../../../styles/globalStyles';
export default function StartButton({
  setModalVisible,
  isBlocked,
  onCancelPress,
  loading
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Start Job Button */}
      <TouchableOpacity
        style={styles.startBtnContainer}
        disabled={loading}
        activeOpacity={0.8}
        onPress={() => {
          if (isBlocked) {
            Toast.show({
              type: 'error',
              text1: 'You are blocked for this ride',
            });

            navigation.navigate('Main', {
              screen: 'HomeMain',
            });

            return;
          }

          setModalVisible(true);
        }}
      >
        <LinearGradient
          colors={['#134E5E', '#71B280']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.btnText}>Start Job</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Cancel Job Button */}
      <TouchableOpacity
        style={[styles.btn, styles.cancelBtn]}
        disabled={loading}
        activeOpacity={0.8}
        onPress={onCancelPress}
      >
        <Text style={styles.btnText}>Cancel Job</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  btn: {
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startBtnContainer: {
    height: 60,
    borderRadius: 15,
    width: '100%',
    elevation: 2,
    shadowColor: '#134E5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  gradientBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.danger, // Danger Red
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
