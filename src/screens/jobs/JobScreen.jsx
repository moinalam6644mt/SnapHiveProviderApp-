import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import JobHomeCard from '../../components/jobs/jobHomeCard';
import AcceptedJobCard from '../../components/jobs/acceptedJobCard';
import CompleteJobCard from '../../components/jobs/completeJobCard';
import OnGoingJobCard from "../../components/jobs/onGoingJobCard"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import OTPVerificationModal from '../../components/OtpVerification/jobStartWithOtp';
import { BookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';
import { AuthUser } from '../../../api/authUser';


import { theme } from '../../styles/globalStyles';
const JobScreen = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [modalVisible, setModalVisible] = useState(false);
  const [acceptedBookingData, setAcceptedBookingData] = useState(null);
  const [ongoingBookingData, setOngoingBookingData] = useState(null);
  const [completeBookingData, setCompleteBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completePage, setCompletePage] = useState(1);
  const [completeTotalPage, setCompleteTotalPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [acceptedTotalPage, setAcceptedTotalPage] = useState(1);
  const [acceptedLoadingMore, setAcceptedLoadingMore] = useState(false);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [ongoingTotalPage, setOngoingTotalPage] = useState(1);
  const [ongoingLoadingMore, setOngoingLoadingMore] = useState(false);
  const navigation = useNavigation();
  const { callApi } = AuthUser();

  const { bookings } = useContext(BookingContext);
  const { userId } = useContext(AuthContext);

  const myBookingData = useMemo(() => {
    if (!userId) return [];

    return bookings.filter(item => item?.worker_ids?.includes(String(userId)));
  }, [bookings, userId]);

  const fetchAcceptedBookingData = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setAcceptedLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let response = await callApi({
        method: 'GET',
        api: `/booking_worker?worker_id=${userId}&status=2&page=${page}`,
        data: {},
      });

      const list = response?.response?.data?.list || [];
      const totalPage = response?.response?.data?.total_page || 1;

      setAcceptedTotalPage(totalPage);
      setAcceptedPage(page);

      if (isLoadMore) {
        setAcceptedBookingData(prev => [...prev, ...list]);
      } else {
        setAcceptedBookingData(list);
      }
    } catch (error) {
      console.warn('Accepted fetch error:', error);
    } finally {
      setLoading(false);
      setAcceptedLoadingMore(false);
    }
  };
  const fetchOngoingBookingData = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setOngoingLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let response = await callApi({
        method: 'GET',
        api: `/booking_worker?worker_id=${userId}&status=3&page=${page}`,
        data: {},
      });

      const list = response?.response?.data?.list || [];
      const totalPage = response?.response?.data?.total_page || 1;

      setOngoingTotalPage(totalPage);
      setOngoingPage(page);

      if (isLoadMore) {
        setOngoingBookingData(prev => [...prev, ...list]);
      } else {
        setOngoingBookingData(list);
      }
    } catch (error) {
      console.warn('Ongoing fetch error:', error);
    } finally {
      setLoading(false);
      setOngoingLoadingMore(false);
    }
  };

  const fetchCompletedBookingData = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let response = await callApi({
        method: 'GET',
        api: `/booking_worker?worker_id=${userId}&status=4&page=${page}`,
        data: {},
      });

      const list = response?.response?.data?.list || [];
      const totalPage = response?.response?.data?.total_page || 1;

      setCompleteTotalPage(totalPage);
      setCompletePage(page);

      if (isLoadMore) {
        // append data
        setCompleteBookingData(prev => [...prev, ...list]);
      } else {
        // first load
        setCompleteBookingData(list);
      }
    } catch (error) {
      console.warn('Completed fetch error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMoreAccepted = () => {
    if (acceptedPage < acceptedTotalPage) {
      fetchAcceptedBookingData(acceptedPage + 1, true);
    }
  };
  const handleLoadMoreOngoing = () => {
    if (ongoingPage < ongoingTotalPage) {
      fetchOngoingBookingData(ongoingPage + 1, true);
    }
  };

  const handleLoadMoreComplete = () => {
    if (completePage < completeTotalPage) {
      fetchCompletedBookingData(completePage + 1, true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAcceptedBookingData(1);
      fetchOngoingBookingData(1);
      fetchCompletedBookingData(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myBookingData])
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main', {
        screen: 'HomeMain',
      });
    }
  };

  const tabs = ['Upcoming', 'Accepted', 'Ongoing','Completed'];

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loaderWrapper}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={theme.background} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      )}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <ChevronLeft size={24} color="#1e1b4b" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabUnderlineBase} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {activeTab === 'Upcoming' && (
          <JobHomeCard myBookingData={myBookingData} userId={userId} />
        )}

        {activeTab === 'Accepted' && (
          <AcceptedJobCard
            acceptedBookingData={acceptedBookingData}
            onStartJob={() => setModalVisible(true)}
            userId={userId}
          />
        )}
        {activeTab === 'Accepted' && acceptedPage < acceptedTotalPage && (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <TouchableOpacity
              onPress={handleLoadMoreAccepted}
              style={styles.loadMoreBtn}
              disabled={acceptedLoadingMore}
            >
              <Text style={styles.loadMoreText}>
                {acceptedLoadingMore ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Ongoing' && (
          <OnGoingJobCard
            ongoingBookingData={ongoingBookingData}
            onStartJob={() => setModalVisible(true)}
            userId={userId}
          />
        )}
        {activeTab === 'Ongoing' && ongoingPage < ongoingTotalPage && (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <TouchableOpacity
              onPress={handleLoadMoreOngoing}
              style={styles.loadMoreBtn}
              disabled={ongoingLoadingMore}
            >
              <Text style={styles.loadMoreText}>
                {ongoingLoadingMore ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Completed' && (
          <CompleteJobCard completeBookingData={completeBookingData} 
            userId={userId} />
        )}
        {activeTab === 'Completed' && completePage < completeTotalPage && (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <TouchableOpacity
              onPress={handleLoadMoreComplete}
              style={styles.loadMoreBtn}
              disabled={loadingMore}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* OTP Modal */}
      <OTPVerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {activeTab === 'Complete' && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <Calendar size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default JobScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  backBtn: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  tabWrapper: {
    marginTop: 20,
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabItem: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#1e1b4b',
  },
  tabUnderlineBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e5e7eb',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#1e1b4b',
    borderRadius: 30,
  },
  loaderWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 28,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e1b4b',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2E2E74',
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loadMoreBtn: {
    backgroundColor: theme.background,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },

  loadMoreText: {
    color: 'white',
    fontWeight: '600',
  },
});
