import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  PermissionsAndroid,
  Alert,
  BackHandler,
} from 'react-native';

import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {Mic, MicOff, Phone, Volume2, VolumeX} from 'lucide-react-native';
import InCallManager from '@videosdk.live/react-native-incallmanager';
import {routeToEarpiece, routeToSpeaker, resetAudio} from '../../services/audioRoute';
import {AuthContext} from '../../context/AuthContext';
import {AuthUser} from '../../../api/authUser';
import {CallContext} from '../../context/CallContext';
import {stopRingtone} from '../../services/ringToneService';

import { theme } from '../../styles/globalStyles';
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIwODNkODE4OC1mZTE5LTQ3YzYtYWEwMi03MTRkNjliNDNmNjkiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc3MjI2NTU0NCwiZXhwIjoxODAzODAxNTQ0fQ.DnnKXMZDTMT8lWUhJF-gU-oSSR5KV9BShoePMB7jmNI';

const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const endSignalReadyRef = useRef(false);
  // Tracks real-time speaker state — readable inside setTimeout without stale closure
  const isSpeakerOnRef = useRef(false);

  const {userData, userId: authUserId} = useContext(AuthContext);
  const {callApi} = AuthUser();

  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // OFF = earpiece by default
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [hasLeftMeeting, setHasLeftMeeting] = useState(false);
  const [customerName, setCustomerName] = useState('Customer');

  const {
    callingData,
    roomId: routeRoomId,
    userId: routeUserId,
    logo,
    booking_id,
  } = route.params || {};
  const {isCallEnded, endCallMeta, resetEndCall} = useContext(CallContext);

  const roomId = callingData?.roomId || routeRoomId || '';
  const worker_id =
    routeUserId || authUserId || userData?.member_id || userData?.id;
  const bookingId = booking_id || callingData?.booking_id || '';
  const fallbackCustomerName =
    callingData?.callerName || callingData?.member_name || 'Customer';

  const localName = 'You';
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
  const remoteAvatarUrl = logo || defaultAvatar;

  const [hasPermissions, setHasPermissions] = useState(
    Platform.OS !== 'android',
  );

  // -------- INIT: Reset end-call signal on mount --------
  useEffect(() => {
    endSignalReadyRef.current = false;
    resetEndCall();
    const t = setTimeout(() => {
      endSignalReadyRef.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, [resetEndCall]);

  // -------- RINGTONE + INCALLMANAGER BOOT --------
  useEffect(() => {
    stopRingtone();
    // Start InCallManager audio session (sets MODE_IN_COMMUNICATION)
    InCallManager.start({media: 'audio', auto: false});
    // Route to earpiece using native module (works for ALL audio streams)
    routeToEarpiece();
    isSpeakerOnRef.current = false;
    return () => {
      stopRingtone();
      InCallManager.stop();
      resetAudio();
    };
  }, []);

  // -------- PERMISSIONS --------
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const requestPermissions = async () => {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
      } catch (err) {
        console.log('Permission error:', err);
      } finally {
        setHasPermissions(true);
      }
    };
    requestPermissions();
  }, []);

  // -------- CUSTOMER NAME --------
  useEffect(() => {
    setCustomerName(prev =>
      !prev || prev === 'Customer' ? fallbackCustomerName : prev,
    );
  }, [fallbackCustomerName]);

  const getBookingDetails = useCallback(async () => {
    if (!worker_id || !bookingId) return;
    const resp = await callApi({
      method: 'GET',
      api: `/booking_details?worker_id=${worker_id}&booking_id=${bookingId}`,
      data: {},
    });
    const fetchedName = resp?.response?.data?.['booking-det']?.customer_name;
    setCustomerName(fetchedName || fallbackCustomerName);
  }, [bookingId, callApi, fallbackCustomerName, worker_id]);

  useEffect(() => {
    getBookingDetails();
  }, [getBookingDetails]);

  // -------- NAVIGATION --------
  const navigateAfterCallEnd = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Main', {screen: 'HomeMain'});
  }, [navigation]);

  // -------- END CALL API --------
  const endCallApi = useCallback(async () => {
    try {
      if (worker_id && !hasLeftMeeting) {
        await callApi({
          method: 'CUSTOM_POST',
          api: `/user/end_call?worker_id=${worker_id}`,
          data: {booking_id: bookingId, roomId: roomId},
        });
        setHasLeftMeeting(true);
        return true;
      }
    } catch (e) {
      console.log('Error ending call:', e);
      return true;
    }
  }, [bookingId, callApi, hasLeftMeeting, roomId, worker_id]);

  // -------- HANDLE END CALL --------
  const handleEndCall = useCallback(
    async () => {
      stopRingtone();

      if (isEndingCall || hasLeftMeeting) {
        navigateAfterCallEnd();
        return;
      }

      setIsEndingCall(true);
      setHasLeftMeeting(true);

      // Leave the WebRTC meeting
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if(window.meeting){ window.meeting.leave(); }
          true;
        `);
      }

      // Release audio session & reset routing
      InCallManager.stop();
      resetAudio();
      setIsSpeakerOn(false);

      await endCallApi();

      setTimeout(() => {
        setIsEndingCall(false);
        navigateAfterCallEnd();
      }, 1000);
    },
    [endCallApi, hasLeftMeeting, isEndingCall, navigateAfterCallEnd],
  );

  // -------- PUSH END-CALL (Pusher) --------
  useEffect(() => {
    if (!isCallEnded) return;
    if (!endSignalReadyRef.current) {
      resetEndCall();
      return;
    }

    const endedRoomId = endCallMeta?.roomId || endCallMeta?.room_id;
    const endedBookingId = endCallMeta?.booking_id;
    const hasEventMeta = Boolean(endedRoomId || endedBookingId);
    const roomMatches = endedRoomId
      ? String(endedRoomId) === String(roomId)
      : false;
    const bookingMatches = endedBookingId
      ? String(endedBookingId) === String(bookingId)
      : false;
    const isSelfEndEvent =
      String(endCallMeta?.caller_id) === String(worker_id) &&
      String(endCallMeta?.call_by || '').toLowerCase() === 'worker';

    if (hasEventMeta && !roomMatches && !bookingMatches) {
      resetEndCall();
      return;
    }
    if (isSelfEndEvent && !isEndingCall) {
      resetEndCall();
      return;
    }

    console.log('📴 Pusher ended call → navigating back');
    resetEndCall();
    handleEndCall();
  }, [
    isCallEnded,
    endCallMeta,
    roomId,
    bookingId,
    worker_id,
    isEndingCall,
    resetEndCall,
    handleEndCall,
  ]);

  // -------- HARDWARE BACK BUTTON --------
  // When call is CONNECTED → show "Return to Call" / "End Call" (like real phone)
  // When call is NOT connected yet → show "End Call" confirmation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isConnected) {
          Alert.alert(
            '📞 Active Call',
            'You are on an active call. What would you like to do?',
            [
              {
                text: 'Return to Call',
                style: 'cancel', // highlighted as primary
              },
              {
                text: 'End Call',
                style: 'destructive',
                onPress: () => handleEndCall(),
              },
            ],
          );
        } else {
          Alert.alert(
            'End Call',
            'Are you sure you want to end this call?',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'End Call', onPress: () => handleEndCall()},
            ],
          );
        }
        return true; // always block default back action
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [handleEndCall, isConnected]),
  );

  // -------- PREVENT LEAVING SCREEN DURING ACTIVE CALL (navigation gesture / swipe) --------
  // Catches ALL navigation-away events: swipe back, programmatic navigate(), etc.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // If call is not active OR we're already ending the call, allow navigation
      if (!isConnected || isEndingCall || hasLeftMeeting) {
        return;
      }
      // Prevent the default navigation action
      e.preventDefault();
      Alert.alert(
        '📞 Active Call',
        'You are on an active call. What would you like to do?',
        [
          {
            text: 'Return to Call',
            style: 'cancel', // stay on screen
          },
          {
            text: 'End Call',
            style: 'destructive',
            onPress: () => handleEndCall(),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, isConnected, isEndingCall, hasLeftMeeting, handleEndCall]);

  // -------- TIMER --------
  useEffect(() => {
    let interval;
    if (isConnected) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // -------- MIC TOGGLE --------
  const handleToggleMic = useCallback(() => {
    const state = !isMicOn;
    setIsMicOn(state);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if(window.toggleMic){ window.toggleMic(${state}); }
        true;
      `);
    }
  }, [isMicOn]);

  // -------- SPEAKER TOGGLE --------
  // Uses our custom native AudioRoute module which calls Android 12+
  // setCommunicationDevice() API — the only API that routes ALL audio
  // (including WebView media audio) to earpiece or speaker reliably.
  const handleToggleSpeaker = useCallback(() => {
    const next = !isSpeakerOnRef.current;
    isSpeakerOnRef.current = next;
    setIsSpeakerOn(next);
    if (next) {
      routeToSpeaker();
    } else {
      routeToEarpiece();
    }
  }, []);

  // -------- WEBVIEW MESSAGE HANDLER --------
  const handleWebViewMessage = useCallback(
    event => {
      const msg = event.nativeEvent.data;
      console.log('WebView:', msg);

      if (msg === 'PARTICIPANT_JOINED') {
        console.log('Participant joined');
        setIsConnected(true);
        setIsSpeakerOn(false);
        isSpeakerOnRef.current = false;
        // Route to earpiece using native Android module.
        // Re-apply at delays since Chrome's audio pipeline resets routing when audio starts.
        routeToEarpiece();
        setTimeout(() => { if (!isSpeakerOnRef.current) routeToEarpiece(); }, 400);
        setTimeout(() => { if (!isSpeakerOnRef.current) routeToEarpiece(); }, 1000);
      }

      if (msg === 'PARTICIPANT_LEFT') {
        console.log('Participant left');
        setIsConnected(false);
        resetAudio();
        InCallManager.stop();
        setIsSpeakerOn(false);
        isSpeakerOnRef.current = false;
        if (!hasLeftMeeting && !isEndingCall) {
          handleEndCall();
        }
      }

      if (msg === 'MEETING_LEFT') {
        setHasLeftMeeting(true);
      }

      if (msg.includes('ERROR')) {
        console.log('WebView Error:', msg);
      }
    },
    [hasLeftMeeting, isEndingCall, handleEndCall],
  );

  // -------- FORMAT TIMER --------
  const formatDuration = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  // -------- HTML (WebView audio call) --------
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://sdk.videosdk.live/js-sdk/0.0.83/videosdk.js"></script>
<style>
  body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #0F172A; display: flex; flex-direction: column; font-family: sans-serif; color: white; overflow: hidden; }
  .audio-container { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #1E293B; }
  .avatar-view { display: flex; flex-direction: column; align-items: center; }
  .avatar-view img { width: 120px; height: 120px; border-radius: 60px; margin-bottom: 20px; border: 4px solid #334155; object-fit: cover; }
  .status-badge { margin-top: 10px; color: #94A3B8; font-size: 14px; }
</style>
</head>
<body>
  <div class="audio-container">
     <div class="avatar-view">
        <img src="${remoteAvatarUrl}" onerror="this.src='${defaultAvatar}'" />
        <h3>${customerName}</h3>
        <div class="status-badge" id="remote-status">Connecting...</div>
     </div>
  </div>
<script>
function send(msg){ window.ReactNativeWebView.postMessage(msg); }

window.onload = async function(){
  try {
    window.VideoSDK.config("${TOKEN}");
    const meeting = window.VideoSDK.initMeeting({
        meetingId: "${roomId}",
        name: "${localName}",
        participantId: "${worker_id}_" + Math.random().toString(36).substring(7),
        micEnabled: true,
        webcamEnabled: false,
        token: "${TOKEN}"
    });
    window.meeting = meeting;
    window.toggleMic = (isEnabled) => { isEnabled ? meeting.unmuteMic() : meeting.muteMic(); };

    meeting.on("meeting-joined", () => {
        send("MEETING_JOINED");
        if (meeting.participants.size > 0) {
           send("PARTICIPANT_JOINED");
           document.getElementById("remote-status").innerText = "On Call";
        }
    });

    meeting.on("participant-joined", (participant) => {
        send("PARTICIPANT_JOINED");
        document.getElementById("remote-status").innerText = "On Call";
        setupAudio(participant);
    });

    meeting.on("participant-left", () => {
        send("PARTICIPANT_LEFT");
        document.getElementById("remote-status").innerText = "Disconnected";
        let audio = document.getElementById("remote-audio");
        if(audio) audio.remove();
    });

    meeting.on("meeting-left", () => { send("MEETING_LEFT"); });
    await meeting.join();
  } catch(e) { send("ERROR:" + e.message); }
}

function setupAudio(participant) {
    participant.on("stream-enabled", (stream) => {
        if(stream.kind === 'audio'){
            let audioEl = document.createElement("audio");
            audioEl.setAttribute("id", "remote-audio");
            audioEl.autoplay = true;
            audioEl.srcObject = new MediaStream([stream.track]);
            document.body.appendChild(audioEl);
        }
    });
    participant.on("stream-disabled", (stream) => {
        if(stream.kind === 'audio'){
            let audioEl = document.getElementById("remote-audio");
            if(audioEl) audioEl.remove();
        }
    });
}
</script>
</body>
</html>
`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {hasPermissions ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{html: htmlContent, baseUrl: 'https://app.videosdk.live/'}}
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          style={styles.webView}
        />
      ) : (
        <View style={styles.center}>
          <Text style={{color: 'white'}}>
            Requesting Microphone Permission...
          </Text>
        </View>
      )}

      {/* Timer - only shown when connected */}
      {isConnected && (
        <View style={styles.topBar}>
          <Text style={styles.timer}>{formatDuration(callDuration)}</Text>
        </View>
      )}

      <View style={styles.controls}>
        {/* Mic Toggle */}
        <TouchableOpacity
          onPress={handleToggleMic}
          style={[styles.btn, !isMicOn && styles.btnOff]}
          disabled={isEndingCall}>
          {isMicOn ? (
            <Mic color="white" size={28} />
          ) : (
            <MicOff color="white" size={28} />
          )}
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          onPress={handleEndCall}
          style={[styles.btn, styles.endCallBtn]}
          disabled={isEndingCall}>
          <Phone color="white" size={32} />
        </TouchableOpacity>

        {/* Speaker Toggle */}
        <TouchableOpacity
          onPress={handleToggleSpeaker}
          style={[
            styles.btn,
            isSpeakerOn && styles.speakerBtnOn,
            !isConnected && styles.btnDisabled,
          ]}
          disabled={!isConnected || isEndingCall}>
          {isSpeakerOn ? (
            <Volume2 color="white" size={28} />
          ) : (
            <VolumeX color={isConnected ? 'white' : '#94A3B8'} size={28} />
          )}
        </TouchableOpacity>
      </View>

      {isEndingCall && (
        <View style={styles.loadingOverlay}>
          <Text style={{color: 'white', fontSize: 18}}>Ending call...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0F172A'},
  webView: {flex: 1, backgroundColor: '#0F172A'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  timer: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    zIndex: 100,
  },
  btn: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnOff: {backgroundColor: '#FCA5A5'},
  endCallBtn: {
    backgroundColor: theme.danger,
    width: 75,
    height: 75,
    borderRadius: 40,
  },
  speakerBtnOn: {
    backgroundColor: 'rgba(99,202,183,0.35)',
    borderColor: '#63cab7',
  },
  btnDisabled: {opacity: 0.35},
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
});