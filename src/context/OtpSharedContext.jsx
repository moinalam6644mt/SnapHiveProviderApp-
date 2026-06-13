import React, { createContext, useContext, useState } from 'react';

const OtpSharedContext = createContext();

export const OtpSharedProvider = ({ children }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [onVerify, setOnVerify] = useState(null);

  return (
    <OtpSharedContext.Provider
      value={{
        bookingDetails,
        setBookingDetails,
        resetTrigger,
        setResetTrigger,
        onVerify,
        setOnVerify,
      }}
    >
      {children}
    </OtpSharedContext.Provider>
  );
};

export const useOtpShared = () => useContext(OtpSharedContext);
