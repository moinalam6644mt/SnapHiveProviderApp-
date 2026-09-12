import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Clock, PlayCircle, AlertTriangle } from 'lucide-react-native';
import { calculateAmount } from '../../../services/calculateAmount';
import { theme } from '../../../styles/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const EndHeader = ({
  bookingDetails,
  providerDetails,
  elapsedSeconds,
  formatTime,
  isLoading,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isCompleted = bookingDetails?.status === '4';

  const startDate = useMemo(() => {
    if (!providerDetails?.start_time) return null;
    const formattedStart = providerDetails.start_time.includes('Z') 
      ? providerDetails.start_time 
      : providerDetails.start_time.replace(' ', 'T') + 'Z';
    return new Date(formattedStart);
  }, [providerDetails]);

  const formattedStartTime = useMemo(() => {
    if (!startDate) return '--';
    return startDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [startDate]);

  const totalDurationSeconds =
    parseFloat(bookingDetails?.duration_hours || 0) * 3600;

  const amountData = useMemo(() => {
    return calculateAmount({
      duration_hours: bookingDetails?.duration_hours,
      rate: bookingDetails?.rate,
      ot_price_per_minute: bookingDetails?.ot_price_per_minute,
      worked_minutes: elapsedSeconds / 60,
      cancelCharge: providerDetails?.previous_cancel_charge,
    });
  }, [bookingDetails, providerDetails, elapsedSeconds]);

  const {workingSeconds, overtimeSeconds, baseAmount, otAmount, isOvertime} =
    amountData;

  const currentAmount = parseFloat(baseAmount + otAmount).toFixed(2);
  const otPricePerMinute = parseFloat(bookingDetails?.ot_price_per_minute || 0);

  const progressPercent = totalDurationSeconds
    ? Math.min(elapsedSeconds / totalDurationSeconds, 1)
    : 0;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.card}>
            <ShimmerPlaceholder style={styles.skeletonTitle} />
            <ShimmerPlaceholder style={styles.skeletonProgressBar} />
            <View style={styles.row}>
               <ShimmerPlaceholder style={styles.skeletonTextMedium} />
               <ShimmerPlaceholder style={styles.skeletonTextMedium} />
            </View>
            <ShimmerPlaceholder style={styles.skeletonTextLong} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'transparent']}
          style={styles.cardTopHighlight}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.card}>
          <Text style={styles.title}>
            Service {isCompleted ? 'Completed' : 'In Progress'}
          </Text>

          {/* Progress Bar */}
          {!isCompleted && (
            <View style={styles.progressBackground}>
              <Animated.View style={{ width: progressWidth }}>
                <LinearGradient
                  colors={isOvertime ? ['#f59e0b', '#d97706'] : ['#4ade80', '#22c55e']}
                  style={styles.progressFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          )}

          {isOvertime && (
            <View style={styles.warningRow}>
              <AlertTriangle size={14} color="#f59e0b" strokeWidth={2.5} />
              <Text style={styles.warningText}>
                Time limit exceeded. Overtime charges apply.
              </Text>
            </View>
          )}

          <View style={styles.dividerLight} />

          <View style={styles.row}>
            <View style={styles.infoBlock}>
              <PlayCircle size={16} color="#71B280" strokeWidth={2} />
              <Text style={styles.startText}>Start: {formattedStartTime}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Clock size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.timeText}>
                {formatTime(elapsedSeconds)}
              </Text>
            </View>
          </View>

          {isOvertime && (
            <View style={[styles.row, { marginTop: 8 }]}>
              <Text style={styles.billingText}>Overtime Duration:</Text>
              <Text style={[styles.timeText, { color: '#f59e0b' }]}>
                {formatTime(overtimeSeconds)}
              </Text>
            </View>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.billingText}>
              Billing calculated based on actual service duration
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default EndHeader;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  gradientBg: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  cardTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.8,
  },
  card: {
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressBackground: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  warningText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ade80',
    marginLeft: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  footerRow: {
    marginTop: 14,
  },
  billingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  skeletonTitle: {
    height: 20,
    width: 130,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonProgressBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonTextMedium: {
    height: 16,
    width: 100,
    borderRadius: 4,
  },
  skeletonTextLong: {
    height: 12,
    width: 220,
    borderRadius: 4,
    marginTop: 16,
  },
});
