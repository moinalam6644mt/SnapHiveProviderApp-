// src/constants/appConfig.js

/**
 * Current installed application version.
 * Keep in sync with android/app/build.gradle versionName and iOS CFBundleShortVersionString.
 */
export const CURRENT_APP_VERSION = '1.1.0';

export const CONFIG_CACHE_KEY = '@snap_worker_app_config_cache_v1';
export const API_CONFIG_URL = 'https://snaphive.online/app/app_config?app_type=worker';

/**
 * Compare two semver-like version strings (e.g., '1.0.0' vs '1.1.0')
 * Returns:
 *   -1 if v1 < v2 (v1 is older than v2)
 *    0 if v1 === v2
 *    1 if v1 > v2 (v1 is newer than v2)
 */
export const compareVersions = (v1, v2) => {
  if (!v1 && !v2) return 0;
  if (!v1) return -1;
  if (!v2) return 1;

  const clean = v =>
    String(v)
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map(part => parseInt(part, 10) || 0);

  const p1 = clean(v1);
  const p2 = clean(v2);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

/**
 * Default fallback configuration in case network is unreachable on first cold start.
 */
export const DEFAULT_FALLBACK_CONFIG = {
  app_type: 'worker',
  app_info: {
    app_name: 'SnapHive',
    site_title: 'Snaphive',
    gst_number: '19PKJPS5988D1Z0',
    currency_symbol: '₹',
    currency_code: 'INR',
    country_code: '+91',
    timezone: 'Asia/Kolkata',
  },
  support: {
    phone: '+91 79033 71185',
    email: 'snaphive.business@gmail.com',
    whatsapp: '+91 79033 71185',
    timing: 'Mon - Sat: 9:00 AM - 8:00 PM',
    address: 'Eraqi Street,South Bazar,Andal,West Bengal,713321',
  },
  urls: {
    privacy_policy_url: 'https://snaphive.online/privacy-policy',
    terms_conditions_url: 'https://snaphive.online/terms-and-conditions',
    refund_policy_url: 'https://snaphive.online/refund-policy',
    about_us_url: 'https://snaphive.online/about-us',
    contact_us_url: 'https://snaphive.online/contact-us',
    help_url: 'https://snaphive.online/help',
    faq_url: 'https://snaphive.online/help',
  },
  location: {
    service_radius_km: 25,
    default_city: 'Kolkata',
  },
  version_control: {
    android: {
      current_version: '1.0.0',
      min_supported_version: '1.0.0',
      force_update: false,
      app_url: 'https://play.google.com/store/apps/details?id=com.snaphiveprovider',
    },
    ios: {
      current_version: '1.0.0',
      min_supported_version: '1.0.0',
      force_update: false,
      app_url: 'https://apps.apple.com/app/snaphive-provider',
    },
  },
  maintenance: {
    is_under_maintenance: false,
    maintenance_message:
      'Partner portal is currently under routine maintenance. Please try again shortly.',
  },
  business_rules: {
    platform_commission_percent: 15,
    cancellation_penalty: 50,
    min_withdrawal_limit: 500,
    min_wallet_balance_limit: -300,
    withdrawal_modes: ['bank', 'upi'],
    otp_resend_timer_seconds: 30,
    required_kyc_docs: ['aadhaar', 'pan'],
    optional_kyc_docs: ['gst', 'voter_id', 'driving_license'],
  },
};
