// src/screens/system/ForceUpdateScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { DownloadCloud, ArrowUpCircle, CheckCircle2 } from 'lucide-react-native';
import { useAppConfig } from '../../context/AppConfigContext';

const { width } = Dimensions.get('window');

export default function ForceUpdateScreen({ isOptional = false, onClose }) {
  const {
    currentInstalledVersion,
    versionData,
    openStore,
    dismissOptionalUpdate,
  } = useAppConfig();

  const targetVersion = versionData?.current_version || 'Latest';

  const handleUpdate = () => {
    openStore();
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    } else {
      dismissOptionalUpdate();
    }
  };

  return (
    <LinearGradient
      colors={['#0a192f', '#0f2744', '#0a192f']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* Ambient background blur circles */}
      <View style={styles.blurCircleTop} />
      <View style={styles.blurCircleBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Badge */}
          <View style={styles.badge}>
            <ArrowUpCircle size={14} color="#38bdf8" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>
              {isOptional ? 'NEW UPDATE AVAILABLE' : 'MANDATORY UPDATE REQUIRED'}
            </Text>
          </View>

          {/* Central Animated Illustration Container */}
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <DownloadCloud size={46} color="#38bdf8" strokeWidth={2.2} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isOptional ? 'A New Update is Ready' : 'Update SnapHive Provider'}
          </Text>

          <Text style={styles.description}>
            {isOptional
              ? 'An update is available with new features and enhancements. Update now for the best experience.'
              : 'A major update is required to continue receiving new bookings, wallet settlements, and customer notifications.'}
          </Text>

          {/* Version Pills Box */}
          <View style={styles.versionBox}>
            <View style={styles.versionCol}>
              <Text style={styles.versionLabel}>Installed Version</Text>
              <Text style={styles.versionValue}>v{currentInstalledVersion}</Text>
            </View>

            <View style={styles.versionDivider} />

            <View style={styles.versionCol}>
              <Text style={styles.versionLabel}>Latest Version</Text>
              <Text style={[styles.versionValue, { color: '#38bdf8' }]}>
                v{targetVersion}
              </Text>
            </View>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Improved booking delivery & map tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Faster wallet withdrawals & payment sync</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>Enhanced stability and critical security fixes</Text>
            </View>
          </View>

          {/* Primary Update Button */}
          <TouchableOpacity
            style={styles.updateBtn}
            activeOpacity={0.8}
            onPress={handleUpdate}
          >
            <LinearGradient
              colors={['#0284c7', '#0369a1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <DownloadCloud size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.updateBtnText}>Update Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Optional Skip button */}
          {isOptional && (
            <TouchableOpacity
              style={styles.skipBtn}
              activeOpacity={0.7}
              onPress={handleSkip}
            >
              <Text style={styles.skipBtnText}>Remind Me Later</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Google Play / App Store • Official SnapHive Release
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
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
    backgroundColor: '#0284c7',
    opacity: 0.15,
  },
  blurCircleBottom: {
    position: 'absolute',
    bottom: -width * 0.4,
    left: -width * 0.3,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: '#10b981',
    opacity: 0.08,
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
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: 'Sora-Bold',
    letterSpacing: 0.8,
  },
  iconCircleOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 22,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  versionBox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  versionCol: {
    flex: 1,
    alignItems: 'center',
  },
  versionDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionLabel: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
  },
  versionValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontFamily: 'Sora-Bold',
  },
  featuresList: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 26,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  updateBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Sora-Bold',
  },
  skipBtn: {
    marginTop: 14,
    paddingVertical: 10,
  },
  skipBtnText: {
    color: '#94a3b8',
    fontSize: 14,
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
