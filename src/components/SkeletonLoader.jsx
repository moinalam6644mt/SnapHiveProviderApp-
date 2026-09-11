import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.card}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <ShimmerPlaceholder style={styles.titleShimmer} />
            <View style={styles.iconRow}>
              <ShimmerPlaceholder style={styles.iconShimmer} />
              <ShimmerPlaceholder style={styles.iconShimmer} />
            </View>
          </View>

          {/* User Row */}
          <View style={styles.userRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShimmerPlaceholder style={styles.smallIconShimmer} />
              <ShimmerPlaceholder style={styles.nameShimmer} />
            </View>
            <ShimmerPlaceholder style={styles.distanceShimmer} />
          </View>

          {/* Location Row */}
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <ShimmerPlaceholder style={styles.smallIconShimmer} />
              <ShimmerPlaceholder style={styles.addressShimmer} />
            </View>
            <ShimmerPlaceholder style={styles.priceShimmer} />
          </View>

          {/* Time Row */}
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <ShimmerPlaceholder style={styles.smallIconShimmer} />
              <ShimmerPlaceholder style={styles.timeShimmer} />
            </View>
            <ShimmerPlaceholder style={styles.durationShimmer} />
          </View>

          {/* Footer Button */}
          <View style={styles.footerRow}>
            <ShimmerPlaceholder style={styles.targetIconShimmer} />
            <ShimmerPlaceholder style={styles.buttonShimmer} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 0.25,
    borderColor: '#308695',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleShimmer: {
    height: 20,
    width: 150,
    borderRadius: 4,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconShimmer: {
    height: 35,
    width: 35,
    borderRadius: 18,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  smallIconShimmer: {
    height: 18,
    width: 18,
    borderRadius: 9,
    marginRight: 8,
  },
  nameShimmer: {
    height: 14,
    width: 90,
    borderRadius: 4,
  },
  distanceShimmer: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    flex: 0.7,
    alignItems: 'center',
  },
  addressShimmer: {
    height: 14,
    width: '90%',
    borderRadius: 4,
  },
  timeShimmer: {
    height: 14,
    width: 110,
    borderRadius: 4,
  },
  priceShimmer: {
    height: 16,
    width: 50,
    borderRadius: 4,
  },
  durationShimmer: {
    height: 12,
    width: 70,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 12,
  },
  targetIconShimmer: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buttonShimmer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
  },
});

export default SkeletonLoader;
