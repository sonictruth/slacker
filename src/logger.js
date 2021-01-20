import EventEmitter from 'eventemitter3';

class Logger extends EventEmitter {
  constructor() {
    super();
    this.logs = [];
    this.maxLength = 100;
    this.eventName = 'log';
  }

  log(...args) {
    console.log(args[0], args[1]);
    const id = Date.now().toString();
    const data = {
      id,
      data: args
    }
    if (this.logs.unshift(data) > this.maxLength) {
      this.logs.pop();
    }

    this.emit(this.eventName, data);
    return this.logs;
  }

  getLogs() {
    return this.logs;
  }

  addLogListener(listener) {
    this.listeners(this.eventName).forEach(
      (oldListener) => {
        if (oldListener.name === listener.name) {
          this.removeListener(this.eventName, oldListener);
        }
      }
    )
    this.addListener(this.eventName, listener);
  }

  clean() {
    this.logs = [];
    this.removeAllListeners();
  }
}

export default new Logger();
