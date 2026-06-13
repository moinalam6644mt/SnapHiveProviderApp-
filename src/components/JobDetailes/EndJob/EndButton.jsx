import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
export default function EndButton({ setModalVisible, isBlocked }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.startBtn}
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
      <Text style={styles.startBtnText}>End Job</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    backgroundColor: '#FF383C',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,

    marginHorizontal: 20,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
