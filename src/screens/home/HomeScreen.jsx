import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AvailabilityToggle from '../../components/Home/AvailabilityToggle';
import Footer from '../../components/Home/Footer';
import HeaderSection from '../../components/Home/HeaderSection';
import JobCard from '../../components/Home/JobCard';
import UpcomingBookingCard from '../../components/Home/UpcomingBookingCard';
import { BookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';
import { AuthUser } from '../../../api/authUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '../../styles/globalStyles';
let cachedAcceptedBookingData = null;
let lastUserId = null;

const HomeScreen = () => {
  const { bookings } = useContext(BookingContext);
  const { userId, userData } = useContext(AuthContext);

  if (lastUserId !== userId) {
    cachedAcceptedBookingData = null;
    lastUserId = userId;
  }

  const [acceptedBookingData, setAcceptedBookingData] = useState(cachedAcceptedBookingData);
  const [loading, setLoading] = useState(!cachedAcceptedBookingData);
  const [isAvailable, setIsAvailable] = useState(true);
  const userName = userData?.profile_name;
  const joiningDate = userData?.register_date;
  const { callApi } = AuthUser();

  const fetchAcceptedData = async () => {
    try {
      if (!cachedAcceptedBookingData) {
        setLoading(true);
      }

      let response = await callApi({
        method: 'GET',
        api: `/booking_worker?worker_id=${userId}&status=2`,
        data: {},
      });

      if (response?.status === 1) {
        const newData = response?.response?.data?.list?.[0] || null;
        cachedAcceptedBookingData = newData;
        setAcceptedBookingData(newData);
      }
    } catch (error) {
      console.warn('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAcceptedData();
    }, []),
  );

  useEffect(() => {
    AsyncStorage.getItem('worker_is_offline').then(val => {
      if (val !== null) {
        setIsAvailable(val === '0');
      }
    });
  }, []);

  const setAvailability = async (available) => {
    setIsAvailable(available);
    try {
      const response = await callApi({
        method: 'CUSTOM_POST',
        api: `/user/set_availability?worker_id=${userId}`,
        data: {
          offline: available ? 0 : 1, 
        },
      });

      if (response?.status === 1) {
        const isOffline = response?.response?.data?.is_offline;
        const serverAvailable = isOffline === 0 || isOffline === '0';
        setIsAvailable(serverAvailable);
        await AsyncStorage.setItem('worker_is_offline', String(isOffline));
      } else {
        setIsAvailable(!available);
      }
    } catch (error) {
      setIsAvailable(!available);
      console.warn('Set availability error:', error);
    }
  };

  // One signal call
  useEffect(() => {
    const loadData = async () => {
      const onesignalId = await AsyncStorage.getItem('onesignal_id');
      const deviceType = await AsyncStorage.getItem('device_type');
      if(onesignalId && deviceType && userId){
        const resp = await callApi({
          method: 'CUSTOM_POST',
          api: `/user/add_device?worker_id=${userId}`,
          data: {
            device_token: onesignalId,
            device_type: deviceType,
          },
        });
        console.log("resp for one signal: ",resp);
      }
    };
    loadData();
  }, []);

  const myBookingData = useMemo(() => {
    if (!userId) return [];
    return bookings.filter(item => {
      let match = false;
      const uidStr = String(userId);
      try {
        if (item?.worker_ids) {
          if (Array.isArray(item.worker_ids)) {
            match = match || item.worker_ids.some(id => String(id) === uidStr);
          } else if (typeof item.worker_ids === 'string') {
            match = match || item.worker_ids.split(',').map(s => s.trim()).includes(uidStr);
            if (!match && item.worker_ids.includes('[')) {
              try {
                const parsed = JSON.parse(item.worker_ids);
                if (Array.isArray(parsed)) {
                  match = match || parsed.some(id => String(id) === uidStr);
                }
              } catch (e) {}
            }
          }
        }
        if (item?.worker_ids_dist) {
          if (Array.isArray(item.worker_ids_dist)) {
            match = match || item.worker_ids_dist.some(w => String(w?.worker_id) === uidStr);
          } else if (typeof item.worker_ids_dist === 'string') {
            try {
              const parsed = JSON.parse(item.worker_ids_dist);
              if (Array.isArray(parsed)) {
                match = match || parsed.some(w => String(w?.worker_id) === uidStr);
              }
            } catch (e) {}
          }
        }
        if (String(item?.worker_id) === uidStr) match = true;
      } catch (e) {
        console.warn(e);
      }
      return match;
    });
  }, [bookings, userId]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
      <HeaderSection userName={userName} joiningDate={joiningDate} />

      {loading ? (
        <View style={styles.loaderWrapper}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={theme.background} />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AvailabilityToggle
            isAvailable={isAvailable}
            onToggle={setAvailability}
          />

          <View style={styles.mainContent}>
            {acceptedBookingData && (
              <JobCard
                acceptedBookingData={acceptedBookingData}
                userId={userId}
              />
            )}
            <Text style={styles.sectionTitle}>Upcoming Booking</Text>

            <UpcomingBookingCard bookings={myBookingData} userId={userId} />
          </View>
        </ScrollView>
      )}

      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginVertical: 15,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 25,
    paddingHorizontal: 35,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 6, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e1b4b',
    fontFamily: 'Sora-SemiBold',
  },
});
