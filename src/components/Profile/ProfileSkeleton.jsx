import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* User Card Skeleton */}
      <View style={styles.userCard}>
        <ShimmerPlaceholder style={styles.avatarShimmer} />
        <View style={styles.userInfoShimmer}>
          <ShimmerPlaceholder style={styles.textShimmerSm} />
          <ShimmerPlaceholder style={styles.textShimmerLg} />
          <ShimmerPlaceholder style={styles.textShimmerMd} />
        </View>
        <ShimmerPlaceholder style={styles.editBtnShimmer} />
      </View>

      {/* Wallet Balance Skeleton */}
      <View style={styles.balanceCard}>
        <View>
          <ShimmerPlaceholder style={styles.labelShimmer} />
          <ShimmerPlaceholder style={styles.amountShimmer} />
        </View>
        <ShimmerPlaceholder style={styles.btnShimmer} />
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.row}>
        <ShimmerPlaceholder style={styles.quickCardShimmer} />
        <ShimmerPlaceholder style={styles.quickCardShimmer} />
      </View>

      {/* Menu Options Skeleton */}
      <View style={styles.menuContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <ShimmerPlaceholder style={styles.menuIconShimmer} />
              <ShimmerPlaceholder style={styles.menuTextShimmer} />
            </View>
            <ShimmerPlaceholder style={styles.menuArrowShimmer} />
          </View>
        ))}
      </View>
      
      {/* Logout Button Skeleton */}
      <ShimmerPlaceholder style={styles.logoutShimmer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.25,
    borderColor: '#308695',
    marginBottom: 10,
    marginTop: 15,
  },
  avatarShimmer: { height: 60, width: 60, borderRadius: 30, marginRight: 15 },
  userInfoShimmer: { flex: 1, gap: 6 },
  textShimmerSm: { height: 10, width: 60, borderRadius: 4 },
  textShimmerLg: { height: 16, width: 120, borderRadius: 4 },
  textShimmerMd: { height: 12, width: 90, borderRadius: 4 },
  editBtnShimmer: { height: 36, width: 36, borderRadius: 18 },

  balanceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.25,
    borderColor: '#308695',
    marginBottom: 20,
  },
  labelShimmer: { height: 16, width: 100, borderRadius: 4, marginBottom: 10 },
  amountShimmer: { height: 26, width: 80, borderRadius: 4 },
  btnShimmer: { height: 40, width: 100, borderRadius: 20 },
  
  row: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  quickCardShimmer: { flex: 1, height: 100, borderRadius: 16 },

  menuContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 0.25,
    borderColor: '#308695',
    padding: 5,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuIconShimmer: { height: 40, width: 40, borderRadius: 12 },
  menuTextShimmer: { height: 14, width: 120, borderRadius: 4 },
  menuArrowShimmer: { height: 20, width: 20, borderRadius: 10 },
  
  logoutShimmer: {
    height: 50,
    width: '100%',
    borderRadius: 25,
  },
});

export default ProfileSkeleton;
