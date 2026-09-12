import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import JobHomeCard from '../../components/jobs/jobHomeCard';
import AcceptedJobCard from '../../components/jobs/acceptedJobCard';
import CompleteJobCard from '../../components/jobs/completeJobCard';
import OnGoingJobCard from "../../components/jobs/onGoingJobCard"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { theme } from '../../styles/globalStyles';
import OTPVerificationModal from '../../components/OtpVerification/jobStartWithOtp';
import { BookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';
import { AuthUser } from '../../../api/authUser';
import SkeletonLoader from '../../components/SkeletonLoader';

const JobScreen = () => {
  const insets = useSafeAreaInsets();
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
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { callApi } = AuthUser();

  const { bookings } = useContext(BookingContext);
  const { userId } = useContext(AuthContext);

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
      if (activeTab === 'Upcoming') {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      } else if (activeTab === 'Accepted') {
        fetchAcceptedBookingData(1);
      } else if (activeTab === 'Ongoing') {
        fetchOngoingBookingData(1);
      } else if (activeTab === 'Completed') {
        fetchCompletedBookingData(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myBookingData, activeTab])
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

  const onRefresh = useCallback(async () => {
    setLoading(true);
    if (activeTab === 'Upcoming') {
      // Upcoming syncs via context, just mock a short delay
      setTimeout(() => setLoading(false), 500);
    } else if (activeTab === 'Accepted') {
      await fetchAcceptedBookingData(1);
    } else if (activeTab === 'Ongoing') {
      await fetchOngoingBookingData(1);
    } else if (activeTab === 'Completed') {
      await fetchCompletedBookingData(1);
    }
  }, [activeTab]);

  const tabs = ['Upcoming', 'Accepted', 'Ongoing','Completed'];

  return (
    <View style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 15 : Platform.OS === 'android' ? 50 : 65 }]}>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
        {/* Sticky Tabs */}
        <View style={styles.tabWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 10 }}
          >
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.activeTabItem,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (activeTab !== tab) {
                    setLoading(true);
                    setActiveTab(tab);
                  }
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {loading ? (
          <View style={{ flex: 1, marginTop: 10 }}>
            <SkeletonLoader />
          </View>
        ) : (
          <>
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
              <CompleteJobCard
                completeBookingData={completeBookingData}
                onStartJob={() => setModalVisible(true)}
                userId={userId}
              />
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
          </>
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
    </View>
  );
};

export default JobScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: theme.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  tabWrapper: {
    paddingTop: 15,
    paddingBottom: 5,
    backgroundColor: '#F5F5F5',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: theme.primary,
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
