import { Pusher } from '@pusher/pusher-websocket-react-native';

class PusherService {
  constructor() {
    this.pusher = null;
  }

  async init() {
    this.pusher = new Pusher();

    await this.pusher.init({
      apiKey: '003e8b8d264c1b8fc52a',
      cluster: 'ap2',

      onConnectionStateChange: (currentState, previousState) => {
        console.log('Connection:', previousState, '→', currentState);
      },

      onError: error => {
        console.log('Pusher Error:', error);
      },
    });

    console.log('Before Pusher initialized - 1');

    await this.pusher.connect();

    console.log('After  Pusher initialized - 2');
  }

  async subscribe(channelName, eventName, callback) {
    if (!this.pusher) return;

    console.log('Before  Pusher Subscribe - 3');

    await this.pusher.subscribe({
      channelName,
      onEvent: event => {
        if (event.eventName === eventName) {
          console.log('EVENT:', event);
          callback(event);
        }
      },
    });

    console.log('After  Pusher Subscribe - 4');
  }

  async subscribeMultiple(channelName, callbacksMap) {
  if (!this.pusher) {
    console.log("❌ Pusher not initialized");
    return;
  }

  console.log("📡 Subscribing to channel:", channelName);

  await this.pusher.subscribe({
    channelName,

    onEvent: event => {
      console.log("📩 PUSHER RAW EVENT:", event);

      if (event && event.eventName) {
        console.log("📌 Event Name:", event.eventName);
      }

      if (event && callbacksMap[event.eventName]) {
        console.log("✅ Matched Event Handler:", event.eventName);

        callbacksMap[event.eventName](event);
      }
    },
  });

  console.log("✅ Subscription completed:", channelName);
}

  async subscribeChat(channelName, callback) {
    if (!this.pusher) return;

    console.log(`[Chat Subscription] Subscribing to generic channel: ${channelName}`);
    
    await this.pusher.subscribe({
      channelName,
      onEvent: event => {
        console.log(`[Chat Event Received]:`, event.eventName);
        callback(event);
      }
    });
  }

  async unsubscribe(channelName) {
    if (!this.pusher) return;

    await this.pusher.unsubscribe({
      channelName,
    });
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
    }
  }
}

export default new PusherService();
