/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import RNCallKeep from 'react-native-callkeep';

// Setup CallKeep Options
const callKeepOptions = {
  ios: {
    appName: 'SnapHiveProvider',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'phone_account_icon',
    additionalPermissions: [],
    // Required to get audio in background when using ConnectionService:
    foregroundService: {
      channelId: 'com.snaphiveprovider',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    }, 
  }
};

RNCallKeep.setup(callKeepOptions).then(accepted => {});

// Background worker for Android connection service
AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => (taskData) => {
  console.log('[Headless] RNCallKeepBackgroundMessage received:', taskData);
  if (taskData) {
    const { roomId, callerName } = taskData;
    if (roomId) {
      RNCallKeep.displayIncomingCall(roomId, 'SnapHive', callerName || 'Customer', 'generic', true);
    }
  }
  return Promise.resolve();
});

AppRegistry.registerComponent(appName, () => App);
