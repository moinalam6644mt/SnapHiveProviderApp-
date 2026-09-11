import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const HistorySkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <View key={i} style={styles.listItem}>
            <View>
              <ShimmerPlaceholder style={styles.dateShimmer} />
              <ShimmerPlaceholder style={styles.idShimmer} />
              <ShimmerPlaceholder style={styles.listAmountShimmer} />
            </View>
            <ShimmerPlaceholder style={styles.statusBadgeShimmer} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  listContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateShimmer: { height: 12, width: 90, borderRadius: 4, marginBottom: 6 },
  idShimmer: { height: 12, width: 130, borderRadius: 4, marginBottom: 8 },
  listAmountShimmer: { height: 14, width: 70, borderRadius: 4 },
  statusBadgeShimmer: { height: 20, width: 60, borderRadius: 10 },
});

export default HistorySkeleton;
