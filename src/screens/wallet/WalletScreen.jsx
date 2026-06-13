import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import WalletBalance from '../../components/Wallet/WalletBalance';
import EarningsCards from '../../components/Wallet/EarningsCards';
import RedeemHistory from '../../components/Wallet/RedeemHistory';
import EarningsDrawer from '../../components/Wallet/Drawer/EarningsDrawer';
import { AuthContext } from '../../context/AuthContext';
import { AuthUser } from '../../../api/authUser';
import PusherService from '../../services/PusherService';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';

import { theme } from '../../styles/globalStyles';
const WalletScreen = () => {
  const [earningsVisible, setEarningsVisible] = useState(false);
  const [sevenDaysData, setSevenDaysData] = useState([]);
  const [earningData, setEarningData] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [filterNumb,setFilterNumb] = useState(1);
  const [walletData,setWalletData] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { userId } = useContext(AuthContext);
  const { callApi } = AuthUser();

  const getWalletData = async()=>{
    try {
      const response = await callApi({
        api: `/user/worker_balance?worker_id=${userId}`,
        method: 'GET',
        data: {} // custom post body
      });
      console.log('[WalletScreen Wallet Data] Data:', response?.response?.data);
      setWalletData(response?.response?.data);
    } catch (error) {
      console.log('[WalletScreen Wallet Data] Error:', error);
    }
  }

   const fetchBookingStatus = async () => {
      if (!userId) return;
      console.log("UserId",userId);
      try {
        const response = await callApi({
          api: `/booking_worker?worker_id=${userId}&status=4&current_page=${filterNumb}`,
          method: 'GET',
          data: {} // custom post body
        });
        console.log('[WalletScreen Booking Status 4] Data:', response?.response?.data);
        const newData = response?.response?.data;
        if (newData) {
          if (filterNumb === 1) {
            setEarningData(newData);
            // Calculate date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            // Get today's date for today's earnings
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            
            let todayTotal = 0;
            
            // Filter list to only include last 7 days data
            const filtered7Days = (newData?.list || []).filter(item => {
              if(!item.booking_date) return false;
              
              const bookingDate = new Date(item.booking_date);
              
              // Add to today's earnings if matched
              if (item.booking_date === todayStr && item.total_amount && item.status === "4") {
                todayTotal += parseFloat(item.total_amount);
              }

              return bookingDate >= sevenDaysAgo;
            });
            
            setTodayEarnings(todayTotal);
            setSevenDaysData(filtered7Days);
          } else {
            setEarningData(prevData => {
              if (!prevData) return newData;
              return {
                ...newData,
                list: [...(prevData.list || []), ...(newData.list || [])]
              };
            });
          }
        }
      } catch (error) {
        console.log('[WalletScreen Booking Status 4] Error:', error);
      }
    };

useEffect(()=>{
  getWalletData();
},[])

  useEffect(()=>{
    fetchBookingStatus();
  },[filterNumb])

  useEffect(() => {
    // Support nested navigation params structure
    const params = route.params?.params || route.params || {};
    console.log('[DEBUG] WalletScreen Route Params:', params);

    // Fetch the specific booking_worker API when screen opens
   

    // If we land on this screen with verifyPayment flag (from Cashfree)
    if (params?.verifyPayment && userId) {
      
      Toast.show({
        type: 'info',
        text1: 'Verifying Payment...',
        text2: 'Waiting for server response...',
        autoHide: false,
        position: 'top',
      });
      
      const channelName = `payment_acknowledgement_${userId}`;
      console.log('[STEP 2] WalletScreen attempting to subscribe to Pusher:', channelName);

      PusherService.subscribeMultiple(channelName, {
        success: (event) => {
          console.log('[STEP 3] Received SUCCESS event from Pusher:', event);
          PusherService.unsubscribe(channelName);

          Toast.hide();
          Toast.show({
            type: 'success',
            text1: 'Payment Successful',
            text2: 'Your recharge was completed successfully.',
            position: 'top',
          });
          
          navigation.setParams({ params: { ...params, verifyPayment: false }});
        },
        error: (event) => {
          console.log('[STEP 3 ERROR] Received ERROR event from Pusher:', event);
          PusherService.unsubscribe(channelName);

          Toast.hide();
          Toast.show({
            type: 'error',
            text1: 'Payment Verification Failed',
            text2: event?.data?.message || 'Server rejected the payment.',
            position: 'top',
          });
          
          navigation.setParams({ params: { ...params, verifyPayment: false }});
        }
      });

      return () => {
        PusherService.unsubscribe(channelName);
      };
    }
  }, [route.params, userId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace('HomeMain');
            }
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WalletBalance walletData={walletData} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings</Text>
        </View>

        <EarningsCards todayEarnings={todayEarnings} onPress={() => setEarningsVisible(true)} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earning History</Text>
          <Text style={styles.subTitle}>(Last 7 Days)</Text>

          <TouchableOpacity style={styles.seeAllBtn} onPress={() => setEarningsVisible(true)}>
            <ChevronRight size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <RedeemHistory data={sevenDaysData} />
      </ScrollView>

      <EarningsDrawer
        visible={earningsVisible}
        earningData={earningData}
        setFilterNumb={setFilterNumb}
        onClose={() => setEarningsVisible(false)}
      />
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  backBtn: {
    marginRight: 15,
    padding: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f3f46',
    fontFamily: 'Sora-Bold',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: 'Sora-Bold',
  },

  subTitle: {
    fontSize: 12,
    color: '#3f3f46',
    marginLeft: 8,
    fontFamily: 'Sora-SemiBold',
  },

  seeAllBtn: {
    marginLeft: 'auto',
  },
});
