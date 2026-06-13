import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';

const StatusModal = ({
  visible,
  type = 'success', // success | error
  message,
  onClose,
}) => {

  const isSuccess = type === 'success';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {isSuccess ? (
            <CheckCircle
              size={70}
              color="#2ECC71"
              style={{ marginBottom: 12 }}
            />
          ) : (
            <XCircle
              size={70}
              color="#E74C3C"
              style={{ marginBottom: 12 }}
            />
          )}

          <Text style={styles.title}>
            {isSuccess ? 'Success' : 'Error'}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 18,
  },

  button: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});