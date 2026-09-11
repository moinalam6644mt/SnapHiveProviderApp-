import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  ChevronLeft,
  Inbox,
} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AuthUser} from '../../../api/authUser';
import {AuthContext} from '../../context/AuthContext';
import { theme } from '../../styles/globalStyles';
import HistorySkeleton from '../../components/Wallet/HistorySkeleton';

const formatDateTime = (datePart, timePart) => {
  if (!datePart || !timePart)
    return `${datePart || ''} ${timePart || ''}`.trim();

  const [year, month, day] = datePart.split('-');
  const [hourStr, min] = timePart.split(':');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthName = months[parseInt(month, 10) - 1];

  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;

  return `${day} ${monthName}, ${year} at ${hour}:${min} ${ampm}`;
};

const EarningsHistoryScreen = () => {
  const navigation = useNavigation();
  const {callApi} = AuthUser();
  const {userId} = useContext(AuthContext);

  const [earningData, setEarningData] = useState(null);
  const [filterNumb, setFilterNumb] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookingStatus = async (pageNumber = 1) => {
    if (!userId) return;
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await callApi({
        api: `/booking_worker?worker_id=${userId}&status=4&current_page=${pageNumber}`,
        method: 'GET',
        data: {} 
      });
      
      const newData = response?.response?.data;
      if (newData) {
        if (pageNumber === 1) {
          setEarningData(newData);
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
      console.warn('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookingStatus(filterNumb);
  }, [filterNumb]);

  const onRefresh = React.useCallback(() => {
    if (!userId) return;
    setRefreshing(true);
    setLoading(true);
    setFilterNumb(1);
    fetchBookingStatus(1).finally(() => {
      setRefreshing(false);
    });
  }, [userId]);

  const handleLoadMore = () => {
    if (!loadingMore && earningData && Number(earningData?.total) > (earningData?.list?.length || 0)) {
      setFilterNumb(prev => prev + 1);
    }
  };

  const listData = earningData?.list || [];

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#1e1b4b" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>

        {loading && filterNumb === 1 ? (
          <HistorySkeleton />
        ) : listData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No Earnings Yet 💸
            </Text>
            <Text style={styles.emptySubText}>
              Complete jobs to see your earnings grow! 🚀
            </Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) => item.booking_id ? item.booking_id.toString() + index : index.toString()}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#308695"]} tintColor="#308695" />
            }
            renderItem={({ item, index }) => {
              const statusText = earningData?.status_map?.[item.status] || 'Unknown';
              const color = item.status === '4' ? '#10b981' : '#d97706';

              return (
                <View style={[styles.card, { marginBottom: 12 }]}>
                  <View style={styles.itemRow}>
                    <View style={styles.infoCol}>
                      <Text style={[styles.accText, { fontFamily: 'Sora-Bold' }]}>
                        {item.category_subchild_name}
                      </Text>
                      <Text style={styles.subText}>
                        Txn ID: {item.booking_id}
                      </Text>
                      <Text style={styles.subText}>
                        {formatDateTime(item.booking_date, item.booking_time)}
                      </Text>
                    </View>

                    <View style={styles.statusCol}>
                      <View style={[styles.badge, { backgroundColor: color }]}>
                        <Text style={styles.badgeText}>{statusText}</Text>
                      </View>
                      <Text style={[styles.amountText, { color: color }]}>
                        ₹{item.total_amount}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={() =>
              loadingMore ? (
                <ActivityIndicator size="small" color="#308695" style={{ marginVertical: 20 }} />
              ) : Number(earningData?.total) > listData.length ? (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={handleLoadMore}>
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default EarningsHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {marginRight: 15},
  headerTitle: {
    fontSize: 20,
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },
  scrollContent: {padding: 20, paddingBottom: 50},
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoCol: { flex: 1, paddingRight: 10 },
  accText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Sora-Regular',
    marginBottom: 2,
  },
  statusCol: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 60,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Sora-SemiBold',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'Sora-Bold',
  },
  loadMoreBtn: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadMoreText: {
    color: '#374151',
    fontFamily: 'Sora-SemiBold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#1e1b4b',
    marginTop: 15,
    fontFamily: 'Sora-SemiBold',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'Sora-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
