// src/screens/system/MaintenanceScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Wrench,
  RefreshCw,
  PhoneCall,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react-native';
import { useAppConfig } from '../../context/AppConfigContext';
import { theme } from '../../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function MaintenanceScreen() {
  const {
    maintenanceMessage,
    refetchConfig,
    openSupportPhone,
    openSupportWhatsApp,
    currentInstalledVersion,
    support,
  } = useAppConfig();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    try {
      await refetchConfig();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        spinValue.stopAnimation();
        spinValue.setValue(0);
      }, 700);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0b1329', '#111e38', '#0b1329']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* Decorative background glows */}
      <View style={styles.blurCircleTop} />
      <View style={styles.blurCircleBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Status Badge */}
          <View style={styles.badge}>
            <ShieldAlert size={14} color="#f59e0b" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>SERVICE UPDATE IN PROGRESS</Text>
          </View>

          {/* Central Icon Illustration */}
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Wrench size={42} color="#308695" strokeWidth={2.2} />
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Under Scheduled Maintenance</Text>
          <Text style={styles.description}>
            {maintenanceMessage ||
              'We are currently upgrading our partner servers to serve you better. We will be back online shortly.'}
          </Text>

          {/* Refresh Action Button */}
          <TouchableOpacity
            style={styles.refreshBtn}
            activeOpacity={0.8}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <LinearGradient
              colors={['#308695', '#1BA9A2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 8 }}>
                <RefreshCw size={18} color="#ffffff" />
              </Animated.View>
              <Text style={styles.refreshBtnText}>
                {isRefreshing ? 'Checking Server Status...' : 'Check Again'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Support Actions Box */}
          <View style={styles.supportBox}>
            <Text style={styles.supportHeading}>Need urgent assistance?</Text>
            <Text style={styles.supportSub}>
              Our partner helpdesk is active {support?.timing || '9:00 AM - 8:00 PM'}
            </Text>

            <View style={styles.supportBtnRow}>
              <TouchableOpacity
                style={styles.supportActionBtn}
                activeOpacity={0.7}
                onPress={() => openSupportPhone()}
              >
                <PhoneCall size={18} color="#38bdf8" style={{ marginRight: 8 }} />
                <Text style={styles.supportActionText}>Call Helpdesk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.supportActionBtn, styles.whatsappBtn]}
                activeOpacity={0.7}
                onPress={() => openSupportWhatsApp()}
              >
                <MessageCircle size={18} color="#22c55e" style={{ marginRight: 8 }} />
                <Text style={[styles.supportActionText, { color: '#22c55e' }]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SnapHive Partner Portal • App v{currentInstalledVersion}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1329',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  blurCircleTop: {
    position: 'absolute',
    top: -width * 0.3,
    right: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: '#308695',
    opacity: 0.18,
  },
  blurCircleBottom: {
    position: 'absolute',
    bottom: -width * 0.4,
    left: -width * 0.3,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: '#f59e0b',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 28,
  },
  badgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontFamily: 'Sora-Bold',
    letterSpacing: 0.8,
  },
  iconCircleOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(48, 134, 149, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(48, 134, 149, 0.3)',
    marginBottom: 24,
  },
  iconCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#f8fafc',
    fontFamily: 'Sora-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  refreshBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#308695',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 28,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Sora-Bold',
  },
  supportBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  supportHeading: {
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'Sora-SemiBold',
    marginBottom: 4,
  },
  supportSub: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 14,
    textAlign: 'center',
  },
  supportBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  supportActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  whatsappBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  supportActionText: {
    color: '#38bdf8',
    fontSize: 13,
    fontFamily: 'Sora-SemiBold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
});
