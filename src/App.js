import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import BackgroundJob from 'react-native-background-actions';

import { task, taskOptions } from './BackgroundTask';

Linking.addEventListener('url', evt => console.log('xxx' + evt.url));

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      serviceRunning: BackgroundJob.isRunning()
    };
  }

  toggleBackground = async () => {
    if (!this.state.serviceRunning) {
      try {
        console.log('Trying to start background service');
        await BackgroundJob.start(task, taskOptions);
        console.log('Successful start!');
        this.setState({
          serviceRunning: true
        });
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      console.log('Stop background service');
      await BackgroundJob.stop();
      this.setState({
        serviceRunning: false
      });
    }

  };
  render() {
    this.playing = BackgroundJob.isRunning();
    return (
      <>
        <SafeAreaView>
          <Text style={{ fontSize: 30, textAlign: 'center', padding: 20 }}>
            Slacker
          </Text>
          <ScrollView contentInsetAdjustmentBehavior="automatic">

            <View>
              <TouchableOpacity
                style={{ width: '100%', backgroundColor: 'gray' }}
                onPress={this.toggleBackground}>

                <Text style={{ fontSize: 20, textAlign: 'center', padding: 20 }}>

                  {this.state.serviceRunning ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}



export default App;
