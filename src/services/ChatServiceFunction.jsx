import { getChannelId } from "../../api/ChatService";
import { Alert } from "react-native";

const handleChat = async (workerId, booking_id, bookingDetails, navigation,member_name,logo,category_subchild_name) => {
    
    const channelId = await getChannelId(workerId, booking_id);

    if (channelId) {
      navigation.navigate('ChatDetails', {
        bookingId: booking_id,
        channelId: channelId,
        member_name:member_name,
        logo:logo,
        category_subchild_name:category_subchild_name,
      });
    } else {
      Alert.alert(
        'Error',
        'Could not create or find chat room. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  export default handleChat;