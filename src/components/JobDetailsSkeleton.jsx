import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const JobDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Fake Header Area (Teal) */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <ShimmerPlaceholder style={styles.backBtnShimmer} />
          <ShimmerPlaceholder style={styles.titleShimmer} />
          <View style={styles.headerActions}>
            <ShimmerPlaceholder style={styles.headerIconShimmer} />
            <ShimmerPlaceholder style={styles.headerIconShimmer} />
          </View>
        </View>
      </View>

      {/* Fake Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Status Indicator Area */}
        <View style={styles.statusRow}>
          <ShimmerPlaceholder style={styles.statusLineShimmer} />
          <ShimmerPlaceholder style={styles.statusIconShimmer} />
          <ShimmerPlaceholder style={styles.statusLineShimmer} />
          <ShimmerPlaceholder style={styles.statusIconShimmer} />
          <ShimmerPlaceholder style={styles.statusLineShimmer} />
        </View>

        {/* Content Card (StartHeader / EndHeader) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShimmerPlaceholder style={styles.cardTitleShimmer} />
          </View>
          <View style={styles.cardUserRow}>
             <ShimmerPlaceholder style={styles.cardIconShimmer} />
             <ShimmerPlaceholder style={styles.cardNameShimmer} />
          </View>
          <View style={styles.cardInfoRow}>
             <ShimmerPlaceholder style={styles.cardIconShimmer} />
             <ShimmerPlaceholder style={styles.cardAddressShimmer} />
          </View>
        </View>

        {/* Second Details Card (StartDetailes / EndDetailes) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShimmerPlaceholder style={styles.cardTitleShimmer} />
          </View>
          
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
        </View>

        {/* Third Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShimmerPlaceholder style={styles.cardTitleShimmer} />
          </View>
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
        </View>

        {/* Fourth Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShimmerPlaceholder style={styles.cardTitleShimmer} />
          </View>
          <View style={styles.cardDetailRow}>
             <ShimmerPlaceholder style={styles.cardDetailKeyShimmer} />
             <ShimmerPlaceholder style={styles.cardDetailValueShimmer} />
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.btnWrapper}>
          <ShimmerPlaceholder style={styles.btnShimmer} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  backBtnShimmer: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
  },
  titleShimmer: {
    width: moderateScale(120),
    height: moderateScale(20),
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconShimmer: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(17.5),
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    paddingTop: verticalScale(20),
    marginTop: verticalScale(10),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: horizontalScale(40),
    marginBottom: verticalScale(20),
  },
  statusLineShimmer: {
    flex: 1,
    height: 2,
  },
  statusIconShimmer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 0.25,
    borderColor: '#308695',
    marginBottom: 20,
  },
  cardHeaderRow: {
    marginBottom: 15,
  },
  cardTitleShimmer: {
    width: 150,
    height: 18,
    borderRadius: 4,
  },
  cardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconShimmer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  cardNameShimmer: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAddressShimmer: {
    width: '80%',
    height: 14,
    borderRadius: 4,
  },
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardDetailKeyShimmer: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  cardDetailValueShimmer: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  btnWrapper: {
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 40,
  },
  btnShimmer: {
    width: '100%',
    height: 54,
    borderRadius: 27,
  }
});

export default JobDetailsSkeleton;
