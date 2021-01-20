import BackgroundJob from 'react-native-background-actions';
import SlackerBot from './SlackerBot';
import logger from './logger';


const notify = async (log) => {
  const [taskTitle, taskDesc, object] = log.data;

  if (BackgroundJob.isRunning()) {
    await BackgroundJob.updateNotification({ taskTitle, taskDesc });
  }
}

logger.addLogListener(notify);

const heartBeatDelay = 500;

export default backgroundTask = async taskData => {
  await new Promise(async (resolve, reject) => {

    let slackerBot = new SlackerBot(
      taskData.token,
      taskData.showTyping,
      1000,
      logger.log.bind(logger),
    );

    slackerBot.connect();

    //FIXME: Find a way to free resources
    let timeoutId;
    const heartBeat = () => {
      clearTimeout(timeoutId);
      if (BackgroundJob.isRunning()) {
        timeoutId = setTimeout(heartBeat, heartBeatDelay);
      } else {
        slackerBot.disconnect();
        slackerBot = null;
      }
    };
    heartBeat();
  });
};
