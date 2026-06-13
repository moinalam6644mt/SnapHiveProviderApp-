import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {ChevronLeft, Calendar as CalendarIcon} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthUser} from '../../../../api/authUser';
import {AuthContext} from '../../../context/AuthContext';
import DatePicker from 'react-native-date-picker';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

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
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthName = months[parseInt(month, 10) - 1];

  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;

  return `${day} ${monthName}, ${year} at ${hour}:${min} ${ampm}`;
};

const WalletHistoryDrawer = ({visible, onClose}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const {callApi} = AuthUser();
  const {userId} = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [allTransactions, setAllTransactions] = useState([]); // full data
  // const [transactions, setTransactions] = useState([]); // show data
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
      console.log(resp, 'Wallet History Response');

      const data = resp?.response?.data;
      if (data && data.list) {
        if (pageNumber === 1) {
          setAllTransactions(data.list); // ✅ save full data
          setTransactions(data.list); // ✅ show all
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
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 40,
      }).start();

      setPage(1);
      fetchHistory(1);
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadMore = () => {
    if (selectedDate) return; // prevent load more when filter applied
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />

      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.drawer, {transform: [{translateY: slideAnim}]}]}>
            <SafeAreaView
              style={{flex: 1}}
              edges={['top', 'bottom', 'left', 'right']}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
                  <ChevronLeft
                    size={moderateScale(24)}
                    color="#1e1b4b"
                    strokeWidth={3}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wallet History</Text>
              </View>

              {selectedDate && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(null);
                    setTransactions(allTransactions);
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: 'red',
                      marginBottom: 10,
                    }}>
                    Clear Filter
                  </Text>
                </TouchableOpacity>
              )}

              {loading && page === 1 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="large" color="#1e1b4b" />
                </View>
              ) : transactions.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: moderateScale(40),
                  }}>
                  <Text
                    style={{fontFamily: 'Poppins-Regular', color: '#6b7280'}}>
                    No transactions found
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
                    paddingBottom: verticalScale(100),
                  }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item}) => {
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
                    const title = item.name
                      ? item.name.replace(/_/g, ' ')
                      : 'Transaction';

                    return (
                      <View
                        style={[
                          styles.card,
                          {marginBottom: verticalScale(12)},
                        ]}>
                        <View style={styles.itemRow}>
                          <View style={styles.infoCol}>
                            <Text
                              style={[styles.accText, {fontWeight: 'bold'}]}>
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
                            <View
                              style={[styles.badge, {backgroundColor: color}]}>
                              <Text style={styles.badgeText}>{statusText}</Text>
                            </View>
                            <Text style={[styles.amountText, {color: color}]}>
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
                        color="#1e1b4b"
                        style={{marginVertical: verticalScale(10)}}
                      />
                    ) : null
                  }
                />
              )}

              {/* Floating Button */}
              {/* <TouchableOpacity
                style={styles.fab}
                onPress={() => setOpenDatePicker(true)}>
                <CalendarIcon size={moderateScale(24)} color="white" />
              </TouchableOpacity> */}
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
      <DatePicker
        modal
        open={openDatePicker}
        date={new Date()}
        mode="date"
        onConfirm={date => {
          setOpenDatePicker(false);

          const formatted = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

          setSelectedDate(formatted);
          filterByDate(formatted); // ✅ apply filter
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />
    </>
  );
};

export default WalletHistoryDrawer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  drawer: {
    // position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
  },

  backBtn: {marginRight: horizontalScale(15)},

  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },

  scrollBody: {padding: moderateScale(20)},

  card: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    borderWidth: moderateScale(1),
    borderColor: '#e5e7eb',
    paddingVertical: verticalScale(5),
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: horizontalScale(16),
  },

  infoCol: {flex: 1},

  accText: {
    fontSize: moderateScale(12),
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    marginBottom: verticalScale(4),
  },

  subText: {
    fontSize: moderateScale(11),
    color: '#6b7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: verticalScale(2),
  },

  statusCol: {alignItems: 'flex-end'},

  badge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(60),
    marginBottom: verticalScale(8),
  },

  badgeText: {
    color: 'white',
    fontSize: moderateScale(11),
    fontFamily: 'Poppins-Regular',
  },

  amountText: {
    fontSize: moderateScale(13),
    fontWeight: 'bold',
    fontFamily: 'Sora-Bold',
  },

  divider: {
    height: moderateScale(1),
    backgroundColor: '#e5e7eb',
    marginHorizontal: horizontalScale(16),
  },

  fab: {
    position: 'absolute',
    bottom: verticalScale(90),
    right: horizontalScale(20),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(5),
  },
});
