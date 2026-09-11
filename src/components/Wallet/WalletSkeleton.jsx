import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const WalletSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Wallet Balance Skeleton */}
      <View style={styles.balanceCard}>
        <View>
          <ShimmerPlaceholder style={styles.labelShimmer} />
          <ShimmerPlaceholder style={styles.amountShimmer} />
        </View>
        <ShimmerPlaceholder style={styles.btnShimmer} />
      </View>

      {/* Section Title Skeleton */}
      <ShimmerPlaceholder style={styles.sectionTitleShimmer} />

      {/* Earnings Cards Skeleton */}
      <View style={styles.row}>
        <ShimmerPlaceholder style={styles.earningCardShimmer} />
        <ShimmerPlaceholder style={styles.earningCardShimmer} />
      </View>

      {/* Section Title Skeleton */}
      <ShimmerPlaceholder style={styles.sectionTitleShimmer} />

      {/* List Skeleton */}
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
  },
  balanceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.25,
    borderColor: '#308695',
    marginBottom: 30,
  },
  labelShimmer: { height: 16, width: 100, borderRadius: 4, marginBottom: 10 },
  amountShimmer: { height: 26, width: 80, borderRadius: 4 },
  btnShimmer: { height: 40, width: 100, borderRadius: 20 },
  
  sectionTitleShimmer: { height: 20, width: 120, borderRadius: 4, marginBottom: 15 },
  
  row: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  earningCardShimmer: { flex: 1, height: 90, borderRadius: 16 },

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

export default WalletSkeleton;
