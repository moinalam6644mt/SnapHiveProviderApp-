import { AuthUser } from './authUser';
 
export const getChannelId = async (workerId, bookingId) => {
    const { callApi } = AuthUser();
    console.log("Called")

    console.log('[getChannelId] Worker ID:', workerId);
    console.log('[getChannelId] Booking ID:', bookingId);
 
  try {
    const resp = await callApi({
      api: `/user/getroom?worker_id=${workerId}`,
      method: 'CUSTOM_POST',
      data:{
        booking_id: bookingId,
      }
    });

    console.log('[getChannelId] Response:', resp);
 
    if (resp?.status === 1 && resp?.response?.data?.channel_id) {
      return resp.response.data.channel_id;
    }
    return null;
  } catch (error) {
    console.error('Error getting channel_id:', error);
    return null;
  }
};