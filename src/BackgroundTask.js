import BackgroundJob from 'react-native-background-actions';
console.log('xxssx', net);

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

export const taskOptions = {
  taskName: 'Slacker',
  taskTitle: 'Slacker',
  taskDesc: 'Slacker',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'slackBotOn://open/service',
  parameters: {
    delay: 1000,
  },
};

export const task = async taskData => {
  await new Promise(async resolve => {
    /*
    const { delay } = taskData;
    for (let i = 0; BackgroundJob.isRunning(); i++) {
      const taskDesc = 'x' + i;
      await BackgroundJob.updateNotification({ taskDesc });
      console.log(slack);
      await sleep(delay);
    }
    */
  });
};

