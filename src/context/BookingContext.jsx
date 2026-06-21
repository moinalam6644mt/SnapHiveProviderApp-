import React, { createContext, useEffect, useState } from 'react';
import PusherService from '../services/PusherService';
import { AuthUser } from '../../api/authUser';
import Toast from 'react-native-toast-message';
import { playBookingChime, stopBookingChime } from '../services/ringToneService';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [countMatchOtp, setCountMatchOtp] = useState(1);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [otpUiText, setOtpUiText] = useState('start');
  const { callApi } = AuthUser();

  useEffect(() => {
    if (bookings.length === 0) {
      stopBookingChime();
    }
  }, [bookings]);

  //This one is for getting data via Pusher

  useEffect(() => {
    const setupPusher = async () => {
      console.log('After Pusher initialized before sending request - 7');

      await PusherService.subscribe(
        'booking_request',
        'booking_service',
        event => {
          console.log('BOOKING EVENT RECEIVED:', event);

          let data = event?.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
              // In case it's double stringified
              if (typeof data === 'string') {
                data = JSON.parse(data);
              }
            } catch (e) {
              console.log('Error parsing pusher data', e);
            }
          }
          if (!data) data = event;

          let isNew = false;
          setBookings(prev => {
            const exists = prev.some(
              item => String(item.order_id) === String(data.order_id),
            );

            if (exists) {
              return prev; // already added, do nothing
            }

            isNew = true;
            data.receivedAt = Date.now();
            return [...prev, data];
          });
          if (isNew) {
            try {
              playBookingChime();
            } catch (e) {
              console.log('Booking chime error:', e);
            }
          }
        },
      );

      await PusherService.subscribe(
        'expire_booking_request',
        'booking-accepted',
        event => {
          let data = event?.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
              if (typeof data === 'string') data = JSON.parse(data);
            } catch (e) {
              console.log('Error parsing pusher data', e);
            }
          }
          if (!data) data = event;

          console.log('BOOKING ACCEPTED BY SOMEONE:', data);

          setBookings(prev =>
            prev.filter(item => item.order_id !== data.order_id),
          );
        },
      );

      console.log('After Pusher initialized After sending request - 8');
    };

    setupPusher();

    return () => {
      PusherService.unsubscribe('booking_request');
      PusherService.unsubscribe('expire_booking_request');
    };
  }, []);

  // Accept and Reject Logic

  const acceptBooking = async (orderId, workerId) => {
    setCurrentBookingId(orderId);
    try {
      const response = await callApi({
        method: 'GET',
        api: '/accept_job',
        data: {
          worker_id: workerId,
          booking_id: orderId,
        },
      });

      console.log('ACCEPT JOB RESPONSE:', response?.response);

      if (response?.status === 1) {
        setBookings(prev =>
          prev.filter(item => String(item.order_id) !== String(orderId)),
        );

        Toast.show({
          type: 'success',
          text1: response?.response?.message || 'Job Accepted',
        });

        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: response?.response?.message || 'Failed to accept job',
        });

        return { success: false };
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network error. Please try again.',
      });

      return { success: false };
    }
  };

  const rejectBooking = orderId => {
    setBookings(prev => prev.filter(item => item.order_id !== orderId));
  };

  const resetOtpState = () => {
    setCountMatchOtp(1);
    setOtpUiText('start');
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        acceptBooking,
        rejectBooking,
        countMatchOtp,
        setCountMatchOtp,
        setOtpUiText,
        otpUiText,
        resetOtpState,
        currentBookingId,
        setCurrentBookingId,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
