import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Inbox,
} from 'lucide-react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const formatDateTime = (datePart, timePart) => {
  if (!datePart || !timePart)
    return `${datePart || ''} ${timePart || ''}`.trim();

  // datePart is expected to be YYYY-MM-DD
  const [year, month, day] = datePart.split('-');
  // timePart is expected to be HH:MM or HH:MM:SS
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

const EarningsDrawer = ({visible, onClose, earningData, setFilterNumb}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0, // Full screen porjonto uthbe
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleLoadMore = () => {
    if (setFilterNumb) {
      setFilterNumb(prev => prev + 1);
    }
  };

  const listData = earningData?.list || [];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.drawer, {transform: [{translateY: slideAnim}]}]}>
          {/* Custom Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
              <ChevronLeft size={24} color="#1e1b4b" strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Earnings</Text>
          </View>

          <ScrollView
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {listData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Inbox size={48} color="#9ca3af" strokeWidth={1.5} />
                <Text style={styles.emptyText}>
                  No transaction records available
                </Text>
                <Text style={styles.emptySubText}>
                  When you earn money, your transactions will appear here.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                {listData.map((item, index) => {
                  const statusText =
                    earningData?.status_map?.[item.status] || 'Unknown';

                  return (
                    <View key={index}>
                      <View style={styles.transactionItem}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.jobTitle}>
                            {item.category_subchild_name}
                          </Text>
                          <View
                            style={[
                              styles.pendingBadge,
                              {
                                backgroundColor:
                                  item.status === '4' ? '#10b981' : '#d97706',
                              },
                            ]}>
                            <Text style={styles.pendingText}>{statusText}</Text>
                          </View>
                        </View>

                        <Text style={styles.infoText}>
                          {formatDateTime(item.booking_date, item.booking_time)}
                        </Text>
                        <Text style={styles.infoText}>
                          Transaction ID: {item.booking_id}
                        </Text>
                        <Text style={styles.amountText}>
                          ₹{item.total_amount}
                        </Text>
                      </View>
                      {index < listData.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {Number(earningData?.total) > listData.length && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Floating Calendar Button */}
          {/* <TouchableOpacity style={styles.fab}>
            <CalendarIcon size={24} color="white" />
          </TouchableOpacity> */}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EarningsDrawer;

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  drawer: {
    backgroundColor: 'white',
    height: SCREEN_HEIGHT - (Platform.OS === 'ios' ? 40 : 20),
    // marginTop: Platform.OS === "ios" ? 50 : 20,
    // borderTopLeftRadius: 25,
    // borderTopRightRadius: 25,
    // paddingTop: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    // borderBottomWidth: 1,
    paddingTop: 10,
    // borderBottomColor: "#f3f4f6",
  },
  backBtn: {marginRight: 15},
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },

  scrollContent: {padding: 20, paddingBottom: 50},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 5,
    marginBottom: 20,
  },
  transactionItem: {padding: 16},
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },
  pendingBadge: {
    backgroundColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pendingText: {color: 'white', fontSize: 11, fontWeight: '500'},

  infoText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'Montserrat-Regular',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginTop: 4,
    fontFamily: 'Sora-Bold',
  },
  divider: {height: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16},

  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loadMoreBtn: {
    marginTop: 20,
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
    fontWeight: '600',
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
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
