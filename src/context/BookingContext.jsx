import React, { createContext, useEffect, useState } from 'react';
import PusherService from '../services/PusherService';
import { AuthUser } from '../../api/authUser';
import Toast from 'react-native-toast-message';
import { playBookingChime } from '../services/ringToneService';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [countMatchOtp, setCountMatchOtp] = useState(1);
  const [currentBookingId,setCurrentBookingId]= useState(null);
  const [otpUiText, setOtpUiText] = useState('start');
  const { callApi } = AuthUser();

  // useEffect(() => {
  //   const dummyBookings = [
  //     {
  //       order_id: 201,
  //       worker_ids: ['20', '15'],
  //       service_name: 'Child Care',
  //       distance: '2km from you',
  //       price_per_hour: 220,
  //       duration: '2 Hours',
  //       timer: '05:30',
  //       order_details: {
  //         customer_name: 'Kari Chanchoda',
  //         booking_date: '2026-02-16 16:00:00',
  //         address: '4517 Washington Ave. Manchester Kentucky 39495',
  //       },
  //     },
  //     {
  //       order_id: 301,
  //       worker_ids: ['20', '18'],
  //       service_name: 'Elder Care',
  //       distance: '1.5km from you',
  //       price_per_hour: 300,
  //       duration: '5 Hours',
  //       timer: '04:10',

  //       order_details: {
  //         customer_name: 'Sanjay Verma',
  //         booking_date: '2026-02-18 09:30:00',
  //         address: '12 Lake View Road, Kolkata 700029',
  //       },
  //     },
  //     {
  //       order_id: 302,
  //       worker_ids: ['20'],
  //       service_name: 'House Cleaning',
  //       distance: '3km from you',
  //       price_per_hour: 200,
  //       duration: '3 Hours',
  //       timer: '02:50',

  //       order_details: {
  //         customer_name: 'Priya Sharma',
  //         booking_date: '2026-02-18 14:00:00',
  //         address: '55 Salt Lake Sector 1, Kolkata 700064',
  //       },
  //     },
  //     {
  //       order_id: 303,
  //       worker_ids: ['15', '20'],
  //       service_name: 'Baby Sitting',
  //       distance: '2.2km from you',
  //       price_per_hour: 250,
  //       duration: '4 Hours',
  //       timer: '01:30',

  //       order_details: {
  //         customer_name: 'Ankit Jain',
  //         booking_date: '2026-02-19 16:00:00',
  //         address: '22 Park Circus, Kolkata 700017',
  //       },
  //     },
  //     {
  //       order_id: 304,
  //       worker_ids: ['20', '9'],
  //       service_name: 'Cooking Service',
  //       distance: '4.1km from you',
  //       price_per_hour: 350,
  //       duration: '6 Hours',
  //       timer: '05:00',

  //       order_details: {
  //         customer_name: 'Meera Iyer',
  //         booking_date: '2026-02-20 11:00:00',
  //         address: '88 Ballygunge Place, Kolkata 700019',
  //       },
  //     },
  //     {
  //       order_id: 305,
  //       worker_ids: ['7', '41'],
  //       service_name: 'Car Washing',
  //       distance: '5km from you',
  //       price_per_hour: 150,
  //       duration: '2 Hours',
  //       timer: '03:15',

  //       order_details: {
  //         customer_name: 'Rohit Gupta',
  //         booking_date: '2026-02-20 08:00:00',
  //         address: '14 New Town Action Area 1, Kolkata 700156',
  //       },
  //     },
  //     {
  //       order_id: 306,
  //       worker_ids: ['20'],
  //       service_name: 'Pet Care',
  //       distance: '1km from you',
  //       price_per_hour: 220,
  //       duration: '3 Hours',
  //       timer: '06:20',

  //       order_details: {
  //         customer_name: 'Sneha Kapoor',
  //         booking_date: '2026-02-21 07:00:00',
  //         address: '77 Behala Chowrasta, Kolkata 700034',
  //       },
  //     },
  //     {
  //       order_id: 307,
  //       worker_ids: ['3', '8', '20'],
  //       service_name: 'Gardening',
  //       distance: '2.8km from you',
  //       price_per_hour: 280,
  //       duration: '4 Hours',
  //       timer: '02:10',

  //       order_details: {
  //         customer_name: 'Amit Roy',
  //         booking_date: '2026-02-22 15:00:00',
  //         address: '90 Dum Dum Park, Kolkata 700055',
  //       },
  //     },
  //   ];

  //   setBookings(dummyBookings);
  // }, []);

  //This one is for getting data via Pusher

  useEffect(() => {
    const setupPusher = async () => {
      console.log('After Pusher initialized before sending request - 7');

      await PusherService.subscribe(
        'booking_request',
        'booking_service',
        event => {
          console.log('BOOKING EVENT RECEIVED:', event);
          const data = event?.data ? JSON.parse(event.data) : event;
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
          const data = event?.data ? JSON.parse(event.data) : event;

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
