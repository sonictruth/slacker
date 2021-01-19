import BackgroundJob from 'react-native-background-actions';
import SlackerBot from './SlackerBot';


const notify = async (taskTitle, taskDesc = '') => {
  console.log('Notification: ', taskTitle, taskDesc);
  if (BackgroundJob.isRunning()) {
    await BackgroundJob.updateNotification({ taskTitle, taskDesc });
  }
}

const heartBeatDelay = 500;

export default backgroundTask = async taskData => {
  await new Promise(async (resolve, reject) => {
    let slackerBot = new SlackerBot(taskData.token, true, 1000, notify);
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
  console.log('done');
};
