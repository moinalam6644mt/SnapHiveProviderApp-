import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthUser } from '../../../api/authUser';
import { AuthContext } from '../../context/AuthContext';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/globalStyles';
import HistorySkeleton from '../../components/Wallet/HistorySkeleton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const formatDateTime = dateString => {
  if (!dateString) return '';

  const parts = dateString.split(' ');
  if (parts.length !== 2) return dateString;

  const [datePart, timePart] = parts;
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

const WalletHistoryScreen = () => {
  const navigation = useNavigation();
  const { callApi } = AuthUser();
  const { userId } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const fetchHistory = async (pageNumber = 1) => {
    if (!userId) return;
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const resp = await callApi({
        api: `/user/transaction_history_worker?worker_id=${userId}&page=${pageNumber}`,
        method: 'GET',
        data: {},
      });

      const data = resp?.response?.data;
      if (data && data.list) {
        if (pageNumber === 1) {
          setAllTransactions(data.list);
          setTransactions(data.list);
        } else {
          setAllTransactions(prev => [...prev, ...data.list]);
          setTransactions(prev => [...prev, ...data.list]);
        }

        if (pageNumber >= parseInt(data.total_page || 1)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (pageNumber === 1) setTransactions([]);
        setHasMore(false);
      }
    } catch (error) {
      console.warn('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterByDate = date => {
    const filtered = allTransactions.filter(item => {
      const itemDate = item.transaction_date?.split(' ')[0];
      return itemDate === date;
    });

    setTransactions(filtered);
  };

  useEffect(() => {
    if (userId) {
      setPage(1);
      fetchHistory(1);
    }
  }, [userId]);

  const onRefresh = React.useCallback(() => {
    if (!userId) return;
    setRefreshing(true);
    setLoading(true);
    setPage(1);
    fetchHistory(1).finally(() => {
      setRefreshing(false);
    });
  }, [userId]);

  const loadMore = () => {
    if (selectedDate) return;
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={moderateScale(24)} color="#1e1b4b" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet History</Text>
        </View>

        {selectedDate && (
          <TouchableOpacity
            onPress={() => {
              setSelectedDate(null);
              setTransactions(allTransactions);
            }}>
            <Text style={{ textAlign: 'center', color: 'red', marginBottom: 10 }}>
              Clear Filter
            </Text>
          </TouchableOpacity>
        )}

        {loading && page === 1 ? (
          <HistorySkeleton />
        ) : transactions.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: moderateScale(40) }}>
            <Text style={{ fontFamily: 'Sora-Bold', color: '#1e1b4b', fontSize: 16, marginBottom: 8 }}>
              No Transactions Found 🧾
            </Text>
            <Text style={{ fontFamily: 'Sora-Regular', color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
              Your transaction history is looking a bit empty! 🌟
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item, index) =>
              item.wallet_transaction_id
                ? item.wallet_transaction_id.toString() + index
                : index.toString()
            }
            contentContainerStyle={{
              padding: horizontalScale(20),
              paddingBottom: verticalScale(40),
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#308695"]} tintColor="#308695" />
            }
            renderItem={({ item }) => {
              const isCredit = parseFloat(item.Amount) >= 0;
              const formattedAmount = isCredit
                ? `+₹${parseFloat(item.Amount).toFixed(2)}`
                : `-₹${Math.abs(parseFloat(item.Amount)).toFixed(2)}`;
              const color =
                item.status === '0'
                  ? '#F58220'
                  : isCredit
                    ? '#2FCA00'
                    : '#FF6565';
              const statusText =
                item.status === '1'
                  ? 'Success'
                  : item.status === '0'
                    ? 'Pending'
                    : 'Failed';
              const title = item.name ? item.name.replace(/_/g, ' ') : 'Transaction';

              return (
                <View style={[styles.card, { marginBottom: verticalScale(12) }]}>
                  <View style={styles.itemRow}>
                    <View style={styles.infoCol}>
                      <Text style={[styles.accText, { fontFamily: 'Sora-Bold' }]}>
                        {title}
                      </Text>
                      <Text style={styles.subText}>
                        Txn ID: {item.wallet_transaction_id}
                      </Text>
                      <Text style={styles.subText}>
                        {formatDateTime(item.transaction_date)}
                      </Text>
                    </View>

                    <View style={styles.statusCol}>
                      <View style={[styles.badge, { backgroundColor: color }]}>
                        <Text style={styles.badgeText}>{statusText}</Text>
                      </View>
                      <Text style={[styles.amountText, { color: color }]}>
                        {formattedAmount}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#308695"
                  style={{ marginVertical: verticalScale(10) }}
                />
              ) : null
            }
          />
        )}
      </SafeAreaView>

      <DatePicker
        modal
        open={openDatePicker}
        date={new Date()}
        mode="date"
        onConfirm={date => {
          setOpenDatePicker(false);
          const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          setSelectedDate(formatted);
          filterByDate(formatted);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />
    </>
  );
};

export default WalletHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
  },
  backBtn: {
    marginRight: horizontalScale(15)
  },
  headerTitle: {
    fontSize: moderateScale(20),
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: verticalScale(5),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: horizontalScale(16),
  },
  infoCol: { flex: 1 },
  accText: {
    fontSize: moderateScale(14),
    color: '#1e293b',
    marginBottom: verticalScale(4),
  },
  subText: {
    fontSize: moderateScale(12),
    color: '#64748b',
    fontFamily: 'Sora-Regular',
    marginBottom: verticalScale(2),
  },
  statusCol: { alignItems: 'flex-end' },
  badge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(60),
    marginBottom: verticalScale(8),
  },
  badgeText: {
    color: 'white',
    fontSize: moderateScale(11),
    fontFamily: 'Sora-SemiBold',
  },
  amountText: {
    fontSize: moderateScale(14),
    fontFamily: 'Sora-Bold',
  },
});
