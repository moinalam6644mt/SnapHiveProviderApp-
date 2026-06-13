import React, {createContext, useCallback, useMemo, useState} from 'react';
import {playRingtone, stopRingtone} from '../services/ringToneService';

export const CallContext = createContext();

export const CallProvider = ({children}) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callVisible, setCallVisible] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [endCallMeta, setEndCallMeta] = useState(null);

  const showIncomingCall = useCallback(callData => {
    console.log('📞 Show Incoming Call:', callData);
    // Reset stale end state so a fresh call does not auto-close.
    setIsCallEnded(false);
    setEndCallMeta(null);
    playRingtone();
    setIncomingCall(callData);
    setCallVisible(true);
  }, []);

  const hideIncomingCall = useCallback(async () => {
    console.log('📴 Hide Incoming Call');
    stopRingtone();
    setIncomingCall(null);
    setCallVisible(false);
  }, []);

  const triggerEndCall = useCallback(meta => {
    // Ensure any pending ringtone is always stopped on end-call signal.
    stopRingtone();
    setEndCallMeta(meta || null);
    setIsCallEnded(true);
  }, []);

  const resetEndCall = useCallback(() => {
    setIsCallEnded(false);
    setEndCallMeta(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      incomingCall,
      callVisible,
      isCallEnded,
      endCallMeta,
      showIncomingCall,
      hideIncomingCall,
      setCallVisible,
      triggerEndCall,
      resetEndCall,
    }),
    [
      incomingCall,
      callVisible,
      isCallEnded,
      endCallMeta,
      showIncomingCall,
      hideIncomingCall,
      triggerEndCall,
      resetEndCall,
    ],
  );

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};
