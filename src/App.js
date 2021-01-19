import React from 'react';

import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  Linking,
  TextInput,
  Switch
} from 'react-native';


import BackgroundJob from 'react-native-background-actions';
import backgroundTask from './backgroundTask';
import backgroundTaskDefaultOptions from './backgroundTaskDefaultOptions';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token: 'xoxp-7498168935-1631598236007-1647182461331-b363535cf7a5e94f4912e695381b53d1',
      showTyping: true,
      serviceRunning: BackgroundJob.isRunning()
    };
  }

  getBackgroundTaskOptions() {
    return {
      parameters: {
        token: this.token
      },
      ...backgroundTaskDefaultOptions
    }
  }

  toggleBackground = async () => {
    if (!this.state.serviceRunning) {
      try {
        await BackgroundJob.start(
          backgroundTask,
          this.getBackgroundTaskOptions()
        );
        this.setState({
          serviceRunning: true
        });
      } catch (e) {
        console.log('Error', e);
      }
    } else {
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
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              style={styles.logo}
              source={require('../icon.png')}
            />
            <Text style={styles.title}>
              Slacker
          </Text>
          </View>

          <View style={styles.spacer} />

          <TextInput
            placeholder={'Slack Token'}
            textContentType={'password'}
            secureTextEntry={true}
            autoCorrect={false}
            style={styles.input}
            value={this.state.token}
            onChangeText={
              token => this.setState({ token })
            }
          />

          <View >

            <Switch
              onValueChange={
                () => this.setState({ showTyping: !this.state.showTyping })
              }
              value={this.state.showTyping}
            />
            <Text>Show typing</Text>
          </View>
          <View style={styles.spacer} />
          <Button
            style={styles.button}
            onPress={this.toggleBackground}
            title={this.state.serviceRunning ? 'Stop' : 'Start'}
            accessibilityLabel="Start Slacker service"
          />

          <View style={styles.spacer} />

          <Text style={styles.help}>
            Slacker requires a Slack Token.
            </Text>
          <Text style={styles.help}>
            To get a token
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('https://github.com/erroneousboat/slack-term/')}> click here
         </Text>.
          </Text>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',

  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    width: 100,
    margin: 20,
  },
  spacer: {
    paddingTop: 20,
  },
  link: {
    color: 'blue',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  }
});

export default App;
