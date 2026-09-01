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
            <ShimmerPlaceholder
              style={styles.titleShimmer}
            />
            <View style={styles.iconGroup}>
              <ShimmerPlaceholder
                style={styles.iconShimmer}
              />
              <ShimmerPlaceholder
                style={styles.iconShimmer}
              />
            </View>
          </View>

          {/* Content Body */}
          <View style={styles.contentBody}>
            <View style={styles.leftCol}>
              <ShimmerPlaceholder style={styles.lineShimmer} />
              <ShimmerPlaceholder style={styles.lineShimmer} />
              <ShimmerPlaceholder style={styles.lineShimmer} />
            </View>
            <View style={styles.rightCol}>
              <ShimmerPlaceholder style={styles.priceShimmer} />
              <ShimmerPlaceholder style={styles.durationShimmer} />
            </View>
          </View>

          {/* Footer Button */}
          <ShimmerPlaceholder
            style={styles.buttonShimmer}
          />
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleShimmer: {
    height: 20,
    width: 150,
    borderRadius: 4,
  },
  iconGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  iconShimmer: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftCol: {
    flex: 1,
    gap: 10,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
  },
  lineShimmer: {
    height: 14,
    width: '80%',
    borderRadius: 4,
  },
  priceShimmer: {
    height: 24,
    width: 80,
    borderRadius: 4,
  },
  durationShimmer: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
  buttonShimmer: {
    height: 48,
    width: '100%',
    borderRadius: 24,
  },
});

export default SkeletonLoader;
