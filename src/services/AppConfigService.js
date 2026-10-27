// src/services/AppConfigService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_CONFIG_URL,
  CONFIG_CACHE_KEY,
  DEFAULT_FALLBACK_CONFIG,
} from '../constants/appConfig';

class AppConfigService {
  /**
   * Load cached config from AsyncStorage if available.
   */
  async getCachedConfig() {
    try {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[AppConfigService] Failed to load cached config:', e);
    }
    return DEFAULT_FALLBACK_CONFIG;
  }

  /**
   * Fetch fresh app configuration from backend.
   * If network fails, falls back to cached data or default fallback.
   */
  async fetchWorkerConfig() {
    try {
      const response = await axios.get(API_CONFIG_URL, {
        timeout: 8000,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      const body = response && response.data ? response.data : null;
      // Handle either structure: body.response.data or body.data
      const configData =
        (body && body.response && body.response.data) ||
        (body && body.data) ||
        null;

      if (configData && typeof configData === 'object') {
        // Cache to storage for instant load on subsequent launches
        await AsyncStorage.setItem(
          CONFIG_CACHE_KEY,
          JSON.stringify(configData)
        );
        return {
          success: true,
          data: configData,
          fromCache: false,
        };
      }
      const message = (body && body.message) ? body.message : 'Invalid config response format';
      throw new Error(message);
    } catch (error) {
      const errorMsg = error && error.message ? error.message : 'Unknown error';
      console.warn('[AppConfigService] Live config fetch failed, using cache:', errorMsg);
      const cached = await this.getCachedConfig();
      return {
        success: false,
        data: cached || DEFAULT_FALLBACK_CONFIG,
        fromCache: true,
        error: errorMsg,
      };
    }
  }
}

export default new AppConfigService();
