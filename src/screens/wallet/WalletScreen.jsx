import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, AlertCircle, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import WalletBalance from '../../components/Wallet/WalletBalance';
import EarningsCards from '../../components/Wallet/EarningsCards';
import RedeemHistory from '../../components/Wallet/RedeemHistory';

import { AuthContext } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';
import { AuthUser } from '../../../api/authUser';
import PusherService from '../../services/PusherService';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import WalletSkeleton from '../../components/Wallet/WalletSkeleton';

import { theme } from '../../styles/globalStyles';
const WalletScreen = () => {
  const [sevenDaysData, setSevenDaysData] = useState([]);
  const [earningData, setEarningData] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [filterNumb,setFilterNumb] = useState(1);
  const [walletData,setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  
  const { userId } = useContext(AuthContext);
  const { appInfo, businessRules } = useAppConfig();
  const currencySymbol = appInfo?.currency_symbol || '₹';
  const minBalanceLimit = businessRules?.min_wallet_balance_limit ?? -300;
  const minWithdrawal = businessRules?.min_withdrawal_limit ?? 500;
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
  if (userId) {
    setLoading(true);
    Promise.all([
      getWalletData(),
      fetchBookingStatus()
    ]).finally(() => {
      setLoading(false);
    });
  }
},[userId, filterNumb])

  const onRefresh = React.useCallback(() => {
    if (!userId) return;
    setRefreshing(true);
    setLoading(true); // Show skeleton on pull to refresh
    Promise.all([
      getWalletData(),
      fetchBookingStatus()
    ]).finally(() => {
      setRefreshing(false);
      setLoading(false);
    });
  }, [userId, filterNumb]);

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
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
        {/* Status Bar */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        
        {loading ? (
          <WalletSkeleton />
        ) : (
          <View style={styles.bottomSheet}>
            <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#308695"]} tintColor="#308695" />
            }
            >
            <WalletBalance walletData={walletData} />

            {/* Negative balance warning if below min_wallet_balance_limit (-₹300) */}
            {walletData?.balance !== undefined && parseFloat(walletData.balance) <= minBalanceLimit && (
              <View style={styles.limitWarningBox}>
                <AlertCircle size={18} color="#ef4444" style={{ marginRight: 8, marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.limitWarningTitle}>Minimum Balance Limit Reached</Text>
                  <Text style={styles.limitWarningText}>
                    Your balance is at or below {currencySymbol}{minBalanceLimit}. Please recharge your wallet to continue receiving new job assignments.
                  </Text>
                </View>
              </View>
            )}

            {/* Business rules info pill */}
            <View style={styles.rulesInfoBox}>
              <Info size={15} color="#308695" style={{ marginRight: 6 }} />
              <Text style={styles.rulesInfoText}>
                Min withdrawal limit: {currencySymbol}{minWithdrawal} • Commission: {businessRules?.platform_commission_percent ?? 15}%
              </Text>
            </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings</Text>
        </View>

        <EarningsCards todayEarnings={todayEarnings} onPress={() => navigation.navigate("EarningsHistoryScreen")} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earning History</Text>
          <Text style={styles.subTitle}>(Last 7 Days)</Text>

          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate("EarningsHistoryScreen")}>
            <ChevronRight size={20} color="#374151" />
          </TouchableOpacity>
        </View>

            <RedeemHistory data={sevenDaysData} />
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
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
  limitWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 12,
    marginTop: 15,
  },
  limitWarningTitle: {
    color: '#b91c1c',
    fontSize: 13,
    fontFamily: 'Sora-Bold',
    marginBottom: 2,
  },
  limitWarningText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  rulesInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  rulesInfoText: {
    color: '#0f766e',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
});
