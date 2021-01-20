import Slack from 'slack';
import logTypes from './logTypes';

class SlackerBot {
  constructor(
    token,
    showTyping = true,
    typingDelayMs = 3000,
    loggerFn = console.log
  ) {
    this.token = token;
    this.typingDelayMs = typingDelayMs;
    this.typingDelayTimerId = null;
    this.showTyping = showTyping;
    this.loggerFn = loggerFn;
    this.reconnectDelay = 10000;
    this.reconnectTimerId = null;
    this.init();
  }

  init() {
    this.webClient = null;
    this.rtmClient = null;
    this.self = null;
    this.team = null;
    this.wsUrl = null;
    this.isConnected = false;
    this.users = [];
    this.channels = [];
  }

  disconnect() {
    clearTimeout(this.reconnectTimerId);
    clearTimeout(this.typingDelayTimerId);
    if (this.isRtmConnected()) {
      this.rtmClient.close();
      this.loggerFn(
        logTypes.DISCONNECTING,
        'Closing Socket connection...'
      );
    }
    this.init();
  }

  connect() {
    this.loggerFn(
      logTypes.CONNECTING,
      'Connecting to Slack...'
    );
    this.webClient = new Slack({ token: this.token });
    return this.webClient.rtm.connect()
      .then(response => {
        this.self = response.self;
        this.team = response.team;
        this.wsUrl = response.url;
      })
      .then(() => Promise.all([
        this.webClient.users.list(),
        this.webClient.conversations.list(),
        this.webClient.users.conversations(),
        this.webClient.users.setPresence({ presence: 'auto' })
      ]))
      .then((usersAndChannelsData) => {
        const [usersData, channelsData] = usersAndChannelsData;
        this.users = usersData.members;
        this.channels = channelsData.channels;
        this.rtmClient = new WebSocket(this.wsUrl);
        this.loggerFn(
          logTypes.CONNECTING,
          'Connecting Socket...'
        );
        this.rtmClient.onerror = this._handleError.bind(this);
        this.rtmClient.onmessage = this._handleIncomingRtmMessage.bind(this);
        this.rtmClient.onclose = this.init.bind(this);
        this.rtmClient.onopen = () => {
          this.isConnected = true;
        }
      }).catch((error) => {
        this._handleError(error, true);
      });;
  }

  getUserName(userId) {
    const user = this.users.find(user => user.id === userId);
    return user ? user.name : 'Unknown';
  }

  getChannelName(channelId) {
    const channel = this.channels.find(channel => channel.id === channelId) || 'Unknown';
    return channel ? channel.name : 'Unknown';
  }

  isRtmConnected() {
    return this.isConnected && this.rtmClient &&
      this.rtmClient.readyState === this.rtmClient.OPEN;
  }

  ping() {
    this._sendRtm('ping', {
      time: Date.now()
    });
  }

  sendTyping(channel) {
    this._sendRtm('typing', {
      channel
    });
  }

  _handleError(error, isSocketError) {
    const message = error ? error.message : 'Unknown';
    this.loggerFn(
      logTypes.ERROR,
      `${message}. Retrying to connect... `,
      error
    );
    this.disconnect();
    this.reconnectTimerId = setTimeout(() => this.connect(), this.reconnectDelay);
  }

  _handleIncomingRtmMessage(message) {
    const parsedMessage = JSON.parse(message.data);
    switch (parsedMessage.type) {
      case 'hello':
        this.loggerFn(
          logTypes.CONNECTED,
          `Host: ${parsedMessage.host_id} Region:${parsedMessage.region}`,
          parsedMessage
        );
        this.connected = true;
        break;
      case 'message':
        this._handleIncomingSlackMessage(parsedMessage);
        break;
      case 'desktop_notification':
        this._handleNotification(parsedMessage);
        break;
    }
  }

  _handleNotification(notification) {
    if (notification.channel) {
      this.loggerFn(
        logTypes.NOTIFICATION,
        `<${notification.subtitle}> ${notification.content}`,
        notification
      );
      if (this.showTyping) {
        clearTimeout(this.typingDelayTimerId);
        this.typingDelayTimerId =
          setTimeout(() => this.sendTyping(notification.channel), this.typingDelayMs);
      }
    }
  }

  _handleIncomingSlackMessage(message) {
    const from = this.getUserName(message.user);
    const channel = this.getChannelName(message.channel);
  }

  _sendRtm(type, payload) {
    const id = Date.now();
    const message = {
      id,
      type,
      ...payload
    }

    if (this.isConnected) {
      this.rtmClient.send(JSON.stringify(message));
    }
  }
}

export default SlackerBot;
