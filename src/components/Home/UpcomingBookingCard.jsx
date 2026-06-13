import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, Info, MapPin, User, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BookingContext } from '../../context/BookingContext';

import { theme } from '../../styles/globalStyles';
const formatPrice = value => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  if (num % 1 === 0) {
    return num.toString();
  }

  return num.toFixed(2).replace(/\.?0+$/, '');
};

const formatDistance = value => {
  if (!value) return 0;

  const num = Number(value);

  return Number.isInteger(num) ? num : num.toFixed(2);
};

const BookingTimer = ({ orderId, receivedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const start = receivedAt || Date.now();
    const passed = Math.floor((Date.now() - start) / 1000);
    return Math.max(60 - passed, 0);
  });

  useEffect(() => {
    const start = receivedAt || Date.now();
    const interval = setInterval(() => {
      const passed = Math.floor((Date.now() - start) / 1000);
      const remaining = 60 - passed;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        onExpire(orderId);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId, receivedAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;


  return (
    <Text style={styles.timerText}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </Text>
  );
};

const UpcomingBookingCard = ({ bookings = [], userId }) => {
  const navigation = useNavigation();
  const { acceptBooking, rejectBooking } = useContext(BookingContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const openDrawer = (instruction) => {
    setSelectedInstruction(instruction);
    setModalVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeDrawer();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleShowMore = (instruction) => {
    openDrawer(instruction);
  };


  if (!bookings.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Upcoming Bookings</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any upcoming jobs at the moment.
        </Text>
      </View>
    );
  }

  return (
    <>
      {bookings.map(item => {
        const { order_id, order_details } = item;
        const {
          category,
          customer_name,
          addressee_name,
          booking_date,
          duration,
          price,
          booking_time,
          address_1,
          address_2,
          landmark, special_instructions,
        } = order_details || {};


        const fullAddress = `${address_1 || ''}, ${address_2 || ''} - ${landmark || ''
          }`;

        const matchedWorker = item.worker_ids_dist?.find(
          w => String(w.worker_id) === String(userId),
        );

        const distance = matchedWorker ? matchedWorker.distance : 0;
        const formattedDistance = formatDistance(distance);

        // Parse backend date safely
        const bookingDate = new Date(booking_date.replace(' ', 'T'));

        const now = new Date();


        // Check if today
        const isToday =
          bookingDate.getDate() === now.getDate() &&
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();

        // Format Day
        const bookingDay = isToday
          ? 'Today'
          : bookingDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

        // Format Time with AM/PM
        const time = bookingDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        return (
          <View key={order_id} style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.jobTitle}>{category || 'Service'}</Text>

              <View style={styles.timerWrapper}>
                <Clock size={16} color="#71717a" />
                <BookingTimer
                  orderId={order_id}
                  receivedAt={item.receivedAt}
                  onExpire={(id) => rejectBooking(id)}
                />
              </View>
            </View>

            <View style={styles.contentBody}>
              {/* Left Side */}
              <View style={styles.leftInfo}>
                <View style={styles.infoItem}>
                  <User size={18} color="#71717a" />
                  <Text style={styles.infoTextMain}>
                    {customer_name ? customer_name : 'User'}
                  </Text>
                </View>

                <View style={[styles.infoItem, { alignItems: 'flex-start' }]}>
                  <MapPin size={18} color="#1e1b4b" />
                  <Text style={styles.addressText}>{fullAddress}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Calendar size={18} color="#71717a" />
                  <View style={styles.dateTimeRow}>
                    <Text style={styles.infoTextSecondary}>{time}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.infoTextSecondary}>{bookingDay}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rightStats}>
                <Text style={styles.distanceText}>{formattedDistance} km from you</Text>
                <Text style={styles.priceText}>₹{formatPrice(price)}/h</Text>
                <Text style={styles.durationText}>Duration: {duration}</Text>
              </View>
            </View>

            {special_instructions ? (
              <TouchableOpacity
                style={styles.instructionBox}
                onPress={() => handleShowMore(special_instructions)}
                activeOpacity={0.7}
              >
                <View style={styles.instructionHeader}>
                  <Info size={14} color="#4338ca" />
                  <Text style={styles.instructionLabel}>Special Instructions</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.instructionText}
                  >
                    {special_instructions}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => rejectBooking(order_id)}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={async () => {
                  const result = await acceptBooking(order_id, userId);

                  if (result?.success) {
                    navigation.push('JobDetailsScreen', {
                      orderId: order_id,
                      userId,
                    });
                  }
                }}
              >
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeDrawer}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateY }] }
            ]}
            onPress={e => e.stopPropagation()}
            {...panResponder.panHandlers}
          >
            <Pressable style={{ width: '100%' }} onPress={e => e.stopPropagation()}>
              <View style={styles.drawerHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.titleContainer}>
                  <Info size={20} color="#4338ca" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Special Instruction</Text>
                </View>
              </View>

              {/* <TouchableOpacity
                onPress={closeDrawer}
                style={styles.drawerCloseBtn}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity> */}

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              // Allow scrolling only when not swiping the whole drawer
              >
                <Pressable style={styles.instructionBody}>
                  <Text style={styles.modalBodyText}>{selectedInstruction}</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

export default UpcomingBookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#312e81',
    fontFamily: 'Sora-Bold',
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#52525b',
    fontFamily: 'Sora-Regular',
  },
  contentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftInfo: {
    flex: 1.2,
    gap: 12,
  },
  rightStats: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTextMain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46',
  },
  addressText: {
    fontSize: 12,
    color: '#52525b',
    lineHeight: 16,
    flexShrink: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTextSecondary: {
    fontSize: 13,
    color: '#52525b',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#71717a',
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
    marginVertical: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#71717a',
  },
  instructionBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionText: {
    fontSize: 13,
    color: '#3730a3',
    flex: 1,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    width: '100%',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  drawerHandle: {
    width: 50,
    height: 6,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  drawerCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: '#f1f5f9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e1b4b',
    fontFamily: 'Sora-Bold',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  instructionBody: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
  },
  modalBodyText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
    fontFamily: 'Sora-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    flex: 1.5,
    backgroundColor: '#4D7C0F',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectText: {
    color: theme.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
