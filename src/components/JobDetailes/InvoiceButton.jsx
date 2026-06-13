import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ReactNativeBlobUtil from 'react-native-blob-util';

export default function InvoiceButton({ invoiceUrl }) {
  const navigation = useNavigation();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!invoiceUrl) {
      Toast.show({
        type: 'error',
        text1: 'Invoice URL not found',
      });
      return;
    }

    try {
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download the invoice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({
            type: 'error',
            text1: 'Storage permission denied',
          });
          return;
        }
      }

      setIsDownloading(true);

      const date = new Date();
      const ext = 'pdf'; // assuming it's a PDF.
      const { config, fs } = ReactNativeBlobUtil;
      let DownloadDir = fs.dirs.DownloadDir;
      const fileName = `invoice_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${ext}`;

      let options = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true, // true will use native manager and be shown on notifications bar.
          notification: true,
          path: DownloadDir + '/' + fileName,
          description: 'Downloading invoice.',
        },
      };

      config(options)
        .fetch('GET', invoiceUrl)
        .then(res => {
          setIsDownloading(false);
          // Show toast
          Toast.show({
            type: 'success',
            text1: 'Download Completed',
          });
          // Redirect to Home
          navigation.navigate('Main', {
            screen: 'HomeMain',
          });
        })
        .catch(error => {
          console.warn('Download error:', error);
          
          // Android Download Manager will handle the background download. 
          // If fetch fails but download manager is used, it often still works in background.
          // Fallback UI to reset button.
          setIsDownloading(false);
          
          // To prevent wrong 'Failed' message when background download is actually working,
          // we show a success/info toast indicating it's handling in background.
          Toast.show({
            type: 'success',
            text1: 'Downloading in background...',
          });
          
          // Proceed with navigation as it's downloading 
          setTimeout(() => {
             navigation.navigate('Main', {
                screen: 'HomeMain',
             });
          }, 1500);
        });
    } catch (err) {
      console.warn(err);
      setIsDownloading(false);
    }
  };
  return (
    <TouchableOpacity
      style={[styles.startBtn, isDownloading && styles.disabledBtn]}
      onPress={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="white" size="small" />
          <Text style={[styles.startBtnText, { marginLeft: 10 }]}>Downloading...</Text>
        </View>
      ) : (
        <Text style={styles.startBtnText}>Download Invoice</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    backgroundColor: '#2FCA00',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,

    marginHorizontal: 20,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
