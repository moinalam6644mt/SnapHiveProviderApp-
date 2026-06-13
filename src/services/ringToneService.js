import Sound from 'react-native-sound';

Sound.setCategory('Playback', true);

let ringtone;
let bookingChime;

export const playRingtone = () => {
  ringtone = new Sound('maidfort.wav', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Sound load error', error);
      return;
    }

    ringtone.setNumberOfLoops(-1);
    ringtone.play();
  });
};

export const stopRingtone = () => {
  if (ringtone) {
    ringtone.stop(() => {
      ringtone.release();
    });
  }
};

// One-shot notification sound played when a new booking is received.
// Keeps its own Sound instance so it doesn't fight with the call ringtone.
export const playBookingChime = () => {
  if (bookingChime) {
    bookingChime.stop(() => {
      bookingChime.setCurrentTime(0);
      bookingChime.play();
    });
    return;
  }
  bookingChime = new Sound('maidfort.wav', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Booking chime load error', error);
      bookingChime = null;
      return;
    }
    bookingChime.setNumberOfLoops(0);
    bookingChime.play(success => {
      if (!success) console.log('Booking chime playback failed');
    });
  });
};
