import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  CheckCheck,
  Check,
  Clock,
  MessageSquare,
  ArrowLeft,
  Phone,
  MoreVertical,
  Paperclip,
  Send,
} from 'lucide-react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {AuthUser} from '../../../api/authUser';
import PusherService from '../../services/PusherService';
import {AuthContext} from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

import { theme } from '../../styles/globalStyles';
const ChatDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {callApi, getMemberData} = AuthUser();
  const [pusherChannel, setPusherChannel] = useState(null);
  const {userId} = useContext(AuthContext);
  const currentUserId = userId ? String(userId) : null;

  const {channelId, member_name, logo, category_subchild_name} =
    route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [chatAvailable, setChatAvailable] = useState(true);
  const [error, setError] = useState(null);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  // Ref always points to the LATEST handlePusherEvent — solves stale closure in Pusher callback
  const pusherHandlerRef = useRef(null);
  // Ref always tracks the current channel name for cleanup (state is stale inside useCallback)
  const pusherChannelRef = useRef(null);

  // Subscribe to channel when channelId and currentUserId are available
  useFocusEffect(
    useCallback(() => {
      if (channelId && currentUserId) {
        subscribeToChannel();
      }
      return () => {
        // Use ref so cleanup always sees the real channel name, not a stale value
        if (pusherChannelRef.current) {
          PusherService.unsubscribe(pusherChannelRef.current);
          pusherChannelRef.current = null;
          setPusherChannel(null);
        }
      };
    }, [channelId, currentUserId]),
  );

  useEffect(() => {
    if (channelId && currentUserId) {
      fetchMessages(channelId);
    } else if (!channelId) {
      setChatAvailable(false);
      setLoading(false);
      setError('Chat room not available');
    }
  }, [channelId, currentUserId]);

  const subscribeToChannel = async () => {
    try {
      if (pusherChannelRef.current === channelId) {
        return;
      }
      const chatChannelName = channelId;
      await PusherService.subscribeChat(chatChannelName, event => {
        // Always call the LATEST handler via ref — never stale
        pusherHandlerRef.current?.(event);
      });
      pusherChannelRef.current = chatChannelName;
      setPusherChannel(chatChannelName);
    } catch (error) {
      console.error('Error subscribing to Pusher channel:', error);
    }
  };

  // Handle Pusher events
  const handlePusherEvent = event => {
    try {
      // Parse the event data
      let eventData = event.data;
      if (typeof eventData === 'string') {
        eventData = JSON.parse(eventData);
      }

      // Handle different event types
      if (event.eventName === 'post_message') {
        handleNewMessage(eventData);
      } else if (event.eventName === 'typing') {
        if (eventData.member_id !== currentUserId) {
          setOtherUserTyping(eventData.typing);

          // Auto-hide typing indicator after 3 seconds
          if (eventData.typing) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setOtherUserTyping(false);
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('Error handling Pusher event:', error);
    }
  };
  // Always keep ref pointing to the latest handler so Pusher callback never goes stale
  pusherHandlerRef.current = handlePusherEvent;

  // Handle new real-time message
  const handleNewMessage = data => {
    setMessages(prevMessages => {
      // Check if message already exists by ID
      const messageExistsById = prevMessages.some(
        msg => msg.message_id?.toString() === data.message_id?.toString(),
      );

      if (messageExistsById) {
        return prevMessages;
      }

      // A message is "mine" if its worker_id matches the current logged-in worker.
      // Member messages have worker_id = null, so they are NEVER "mine".
      const isMeMessage = data.worker_id?.toString() === currentUserId;

      // Only attempt to replace an optimistic message for OUR OWN messages coming back from Pusher.
      // Member messages should ALWAYS append — never match against worker’s optimistic messages.
      const existingTempMessageIndex = isMeMessage
        ? prevMessages.findIndex(
            msg =>
              (msg.status === 'sending' || msg.status === 'sent') &&
              msg.message === data.message &&
              msg.worker_id?.toString() === currentUserId,
          )
        : -1;

      const newMessage = {
        message_id: data.message_id?.toString() || Date.now().toString(),
        conversations_id: channelId,
        member_id: data.member_id?.toString(),
        worker_id: data.worker_id?.toString(),
        sending_date: data.created_datetime || new Date().toISOString(),
        message: data.message,
        sender_profile: {
          name: isMeMessage ? 'You' : data.sender_profile?.name || member_name,
          email: data.sender_profile?.email || '',
          logo: data.sender_profile?.logo || logo,
        },
        status: isMeMessage ? 'sent' : 'delivered',
      };

      if (existingTempMessageIndex !== -1) {
        // Replace the existing optimistic message with the final one from Pusher
        const updatedMessages = [...prevMessages];
        updatedMessages[existingTempMessageIndex] = newMessage;

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);

        return updatedMessages;
      }

      // Scroll to bottom after new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);

      return [...prevMessages, newMessage];
    });
  };

  const fetchMessages = async channelId => {
    try {
      setLoading(true);
      setError(null);

      const resp = await callApi({
        api: `/user/message_list?worker_id=${currentUserId}`,
        method: 'GET',
        data: {
          chatroom: channelId,
        },
      });

      if (resp?.status === 1) {
        const messagesData = resp?.response?.data?.all_mesages;

        if (messagesData && Array.isArray(messagesData)) {
          // API returns newest-first, reverse to show oldest at top & newest at bottom
          setMessages([...messagesData].reverse());
          setChatAvailable(true);
        } else {
          setMessages([]);
          setChatAvailable(true);
        }
      } else {
        setChatAvailable(false);
        setError(resp?.message || 'Failed to load chat messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatAvailable(false);
      setError('Chat room not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !chatAvailable || !currentUserId) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    const tempMessage = {
      message_id: Date.now().toString(),
      conversations_id: channelId,
      worker_id: currentUserId,
      sending_date: new Date().toISOString(),
      message: messageText,
      sender_profile: {
        name: 'You',
        email: '',
        logo: logo,
      },
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);

    try {
      const payload = {
        channel_id: channelId,
        message: messageText,
      };

      const response = await callApi({
        api: `/user/sendmessage?worker_id=${currentUserId}`,
        method: 'CUSTOM_POST',
        data: payload,
      });

      if (response?.status === 1) {
        // Message sent successfully - will be updated by Pusher
        setMessages(prev =>
          prev.map(msg =>
            msg.message_id === tempMessage.message_id
              ? {
                  ...msg,
                  status: 'sent',
                }
              : msg,
          ),
        );
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessages(prev =>
        prev.filter(msg => msg.message_id !== tempMessage.message_id),
      );
    } finally {
      setSending(false);
    }
  };

  const handleTyping = text => {
    setInputText(text);

    if (pusherChannel && channelId && text.length > 0) {
      try {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 2000);
      } catch (error) {
        console.error('Error emitting typing event:', error);
      }
    }
  };

  const handleAudioCall = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'This feature is not implemented yet.',
      });
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start audio call');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDate = timestamp => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({item, index}) => {
    if (!currentUserId) return null;

    // If worker_id exists, it shows right (isMe). If null, it shows left (!isMe).
    const isMe =
      item.worker_id !== null &&
      item.worker_id !== undefined &&
      item.worker_id !== '';

    const showDate =
      index === 0 ||
      (messages[index - 1] &&
        formatDate(new Date(messages[index - 1]?.sending_date)) !==
          formatDate(new Date(item.sending_date)));

    return (
      <View key={item.message_id}>
        {showDate && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateText}>{formatDate(item.sending_date)}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isMe ? styles.myMessageRow : styles.theirMessageRow,
          ]}>
          {!isMe && (
            <Image
              source={{uri: item.sender_profile?.logo || logo}}
              style={styles.messageAvatar}
            />
          )}

          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myBubble : styles.theirBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.theirMessageText,
              ]}>
              {item.message}
            </Text>

            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isMe ? styles.myMessageTime : styles.theirMessageTime,
                ]}>
                {formatTime(item.sending_date)}
              </Text>

              {isMe && item.status && (
                <>
                  {item.status === 'read' ? (
                    <CheckCheck
                      size={16}
                      color="#4caf50"
                      style={styles.statusIcon}
                    />
                  ) : item.status === 'delivered' ? (
                    <CheckCheck
                      size={16}
                      color="#4caf50"
                      style={styles.statusIcon}
                    />
                  ) : item.status === 'sent' ? (
                    <Check size={16} color="#999" style={styles.statusIcon} />
                  ) : (
                    <Clock size={16} color="#999" style={styles.statusIcon} />
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyChat = () => (
    <View style={styles.emptyChatContainer}>
      <MessageSquare size={80} color="#ccc" />
      <Text style={styles.emptyChatTitle}>No Messages Yet</Text>
      <Text style={styles.emptyChatText}>
        Start a conversation with {member_name || 'user'}
      </Text>
    </View>
  );

  const renderChatUnavailable = () => (
    <View style={styles.unavailableContainer}>
      <MessageSquare size={80} color="#ccc" />
      <Text style={styles.unavailableTitle}>Chat Not Available</Text>
      <Text style={styles.unavailableText}>
        {error || 'This chat room is not available or has been closed'}
      </Text>
      <TouchableOpacity
        style={styles.initiateButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.initiateButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading while getting current user ID
  if (!currentUserId && loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (!chatAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{width: 40}} />
        </View>
        {renderChatUnavailable()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={dismissKeyboard}
          activeOpacity={0.7}>
          {/* Profile Initial Circle (Logo replace kora hoyeche) */}
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>
              {member_name ? member_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View>
            <Text style={styles.headerName}>{member_name || 'User'}</Text>
            <Text style={styles.headerStatus}>Customer</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {/* <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAudioCall}
          >
            <Phone size={24} color={theme.accent} />
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.headerButton}> */}
          {/* <MoreVertical size={24} color="#333" /> */}
          {/* </TouchableOpacity> */}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item =>
              item.message_id?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: true})
            }
            onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
            inverted={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={renderEmptyChat}
          />
        </TouchableWithoutFeedback>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* <TouchableOpacity style={styles.attachButton}> */}
          {/* <Paperclip size={24} color={theme.accent} /> */}
          {/* </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={focusInput}
            activeOpacity={1}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={'#999'}
              value={inputText}
              onChangeText={handleTyping}
              multiline
              maxLength={500}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({animated: true});
                }, 100);
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}>
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" style={{marginLeft: -2}} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accent, // Tomar theme color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexGrow: 1,
  },
  dateDivider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  theirMessageRow: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: theme.accent,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirMessageTime: {
    color: '#999',
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    bottom: 20,
  },
  attachButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: theme.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyChatTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -50,
  },
  unavailableTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  unavailableText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  initiateButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
  },
  initiateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ChatDetailsScreen;
