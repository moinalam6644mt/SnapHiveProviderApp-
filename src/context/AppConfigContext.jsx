// src/context/AppConfigContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import AppConfigService from '../services/AppConfigService';
import {
  CURRENT_APP_VERSION,
  DEFAULT_FALLBACK_CONFIG,
  compareVersions,
} from '../constants/appConfig';

export const AppConfigContext = createContext(null);

export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_FALLBACK_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [optionalUpdateDismissed, setOptionalUpdateDismissed] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      // 1. First get cached config quickly
      const cached = await AppConfigService.getCachedConfig();
      if (cached) {
        setConfig(cached);
      }

      // 2. Fetch fresh config over network
      const result = await AppConfigService.fetchWorkerConfig();
      if (result?.data) {
        setConfig(result.data);
      }
    } catch (e) {
      console.warn('[AppConfigContext] Error in loadConfig:', e);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Active platform version control node
  const versionData = useMemo(() => {
    const vc = config?.version_control;
    if (!vc) return null;
    return Platform.OS === 'ios' ? vc?.ios : vc?.android;
  }, [config]);

  // Determine force update vs optional update
  const { isForceUpdate, isOptionalUpdate } = useMemo(() => {
    if (!versionData) {
      return { isForceUpdate: false, isOptionalUpdate: false };
    }

    const {
      current_version: remoteVersion,
      min_supported_version: minVersion,
      force_update: serverForceUpdateFlag,
    } = versionData;

    // Check if installed app is below min supported version -> Mandatory Update
    const isBelowMin =
      minVersion && compareVersions(CURRENT_APP_VERSION, minVersion) < 0;

    // Check if server marked force_update AND installed version is below remote current_version
    const isForcedBelowRemote =
      Boolean(serverForceUpdateFlag) &&
      remoteVersion &&
      compareVersions(CURRENT_APP_VERSION, remoteVersion) < 0;

    const force = Boolean(isBelowMin || isForcedBelowRemote);

    // Optional update if a newer version exists, but not forced and not dismissed
    const hasNewerVersion =
      remoteVersion && compareVersions(CURRENT_APP_VERSION, remoteVersion) < 0;
    const optional = Boolean(!force && hasNewerVersion && !optionalUpdateDismissed);

    return {
      isForceUpdate: force,
      isOptionalUpdate: optional,
    };
  }, [versionData, optionalUpdateDismissed]);

  // Maintenance flags
  const isMaintenance = useMemo(() => {
    return Boolean(config?.maintenance?.is_under_maintenance);
  }, [config]);

  const maintenanceMessage = useMemo(() => {
    return (
      config?.maintenance?.maintenance_message ||
      'Partner portal is currently under routine maintenance. Please try again shortly.'
    );
  }, [config]);

  // Store URL
  const appStoreUrl = useMemo(() => {
    if (versionData?.app_url) return versionData.app_url;
    return Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/snaphive-provider'
      : 'https://play.google.com/store/apps/details?id=com.snaphiveprovider';
  }, [versionData]);

  // Quick Action Utilities
  const openStore = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(appStoreUrl);
      if (supported) {
        await Linking.openURL(appStoreUrl);
      } else {
        await Linking.openURL(appStoreUrl);
      }
    } catch (e) {
      console.warn('[AppConfigContext] Could not open store URL:', e);
      Alert.alert('Error', 'Unable to open app store link.');
    }
  }, [appStoreUrl]);

  const openSupportPhone = useCallback((overrideNumber) => {
    const rawNumber = overrideNumber || config?.support?.phone || '+91 79033 71185';
    const cleanNumber = String(rawNumber).replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(err => {
      console.warn('Failed to make phone call:', err);
      Alert.alert('Notice', `Please call support at ${rawNumber}`);
    });
  }, [config]);

  const openSupportWhatsApp = useCallback((overrideNumber, customMessage) => {
    const rawNumber = overrideNumber || config?.support?.whatsapp || config?.support?.phone || '917903371185';
    const cleanNumber = String(rawNumber).replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      customMessage ||
        `Hello SnapHive Support, I am a registered service partner reaching out for assistance.`
    );
    const url = `whatsapp://send?phone=${cleanNumber}&text=${defaultMsg}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web WhatsApp if native app is not installed
      Linking.openURL(`https://wa.me/${cleanNumber}?text=${defaultMsg}`).catch(e => {
        Alert.alert('Notice', `WhatsApp is not available. Call support at: ${config?.support?.phone}`);
      });
    });
  }, [config]);

  const openSupportEmail = useCallback((subject, body) => {
    const email = config?.support?.email || 'snaphive.business@gmail.com';
    const sub = encodeURIComponent(subject || 'Partner Support Inquiry');
    const msg = encodeURIComponent(body || '');
    Linking.openURL(`mailto:${email}?subject=${sub}&body=${msg}`).catch(() => {
      Alert.alert('Support Email', email);
    });
  }, [config]);

  const dismissOptionalUpdate = useCallback(() => {
    setOptionalUpdateDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      config,
      isLoadingConfig,
      isMaintenance,
      maintenanceMessage,
      isForceUpdate,
      isOptionalUpdate,
      dismissOptionalUpdate,
      currentInstalledVersion: CURRENT_APP_VERSION,
      versionData,
      appStoreUrl,
      appInfo: config?.app_info || DEFAULT_FALLBACK_CONFIG.app_info,
      support: config?.support || DEFAULT_FALLBACK_CONFIG.support,
      urls: config?.urls || DEFAULT_FALLBACK_CONFIG.urls,
      locationConfig: config?.location || DEFAULT_FALLBACK_CONFIG.location,
      businessRules: config?.business_rules || DEFAULT_FALLBACK_CONFIG.business_rules,
      paymentGateways: config?.payment_gateways || {},
      refetchConfig: loadConfig,
      openStore,
      openSupportPhone,
      openSupportWhatsApp,
      openSupportEmail,
    }),
    [
      config,
      isLoadingConfig,
      isMaintenance,
      maintenanceMessage,
      isForceUpdate,
      isOptionalUpdate,
      dismissOptionalUpdate,
      versionData,
      appStoreUrl,
      loadConfig,
      openStore,
      openSupportPhone,
      openSupportWhatsApp,
      openSupportEmail,
    ],
  );

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
