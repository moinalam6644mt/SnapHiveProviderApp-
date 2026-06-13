import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

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
        style={[styles.btn, styles.startBtn]}
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
        <Text style={styles.btnText}>Start Job</Text>
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
  startBtn: {
    backgroundColor: '#47970B', // Primary Orange
  },
  cancelBtn: {
    backgroundColor: '#EF4444', // Danger Red
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
