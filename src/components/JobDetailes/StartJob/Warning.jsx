import { View, Text, StyleSheet } from 'react-native';
import { Info, FileText } from 'lucide-react-native';

const Warning = ({ instructions }) => {
  return (
    <View style={styles.container}>
      {instructions ? (
        <View style={styles.instructionAlert}>
          <FileText size={18} color="#9A3412" style={{marginTop: 2}} />
          <View style={styles.instructionContent}>
            <Text style={styles.instructionLabel}>Service Instructions:</Text>
            <Text style={styles.instructionText}>{instructions}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.infoAlert}>
        <Info size={18} color="#4D7C0F" />
        <Text style={styles.infoText}>
          Amount will be calculated based on actual time.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  instructionAlert: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    padding: 15,
  },
  instructionContent: {
    marginLeft: 10,
    flex: 1,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 18,
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#166534',
    flex: 1,
  },
});

export default Warning;
