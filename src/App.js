import React from 'react';

import {
  ScrollView,
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
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';

const settingPrefix = 'setting_';
const tokenHelpLink = 'https://github.com/erroneousboat/slack-term/wiki#running-slack-term-without-legacy-tokens';
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      serviceRunning: BackgroundJob.isRunning(),
      settingsLoaded: false
    };
    this.state[`${settingPrefix}token`] = '';
    this.state[`${settingPrefix}showTyping`] = true;
  }

  async componentDidMount() {
    await this.loadSettings();
    this.setState({ settingsLoaded: true });
  }

  async loadSettings() {
    const promises = this.getSettingsKeys()
      .map(async (key) => {
        return RNSecureStorage.get(key)
          .then(value => {
            this.state[key] = JSON.parse(value);
          })
          .catch(error => console.log('Setting not found: ', error.message));
      });
    return Promise.all(promises);
  }

  getSettingsKeys() {
    return Object.keys(this.state)
      .filter(key => key.startsWith(settingPrefix));
  }

  getSetting(key) {
    return this.state[`${settingPrefix}${key}`];
  }

  async updateSetting(key, value) {
    key = `${settingPrefix}${key}`;
    const setting = {};
    setting[key] = value;
    this.setState(setting);
    await RNSecureStorage.set(key, JSON.stringify(value),
      { accessible: ACCESSIBLE.WHEN_UNLOCKED }
    )
  }

  getBackgroundTaskOptions() {
    return {
      parameters: {
        token: this.getSetting('token')
      },
      ...backgroundTaskDefaultOptions
    }
  }

  toggleBackground = async () => {
    if (!this.state.serviceRunning) {
      await BackgroundJob.start(
        backgroundTask,
        this.getBackgroundTaskOptions()
      );
    } else {
      await BackgroundJob.stop();
    }
    this.setState({
      serviceRunning: BackgroundJob.isRunning()
    });
  };

  render() {
    return (
      <>
        { !this.state.settingsLoaded ? <></> :
          <ScrollView style={styles.container}>
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
            <Text>
              Slack Token:
             </Text>
            <TextInput
              editable={!this.state.serviceRunning}
              placeholder={'Slack Token'}
              textContentType={'password'}
              secureTextEntry={true}
              autoCorrect={false}
              style={styles.input}
              value={this.getSetting('token')}
              onChangeText={
                token => this.updateSetting('token', token)
              }
            />
            <Text>Show typing:</Text>
            <View style={styles.switchContainer}>
              <Switch
                style={{ display: 'flex', flex: 0.1 }}
                disabled={this.state.serviceRunning}
                onValueChange={
                  () => this.updateSetting('showTyping', !this.getSetting('showTyping'))
                }
                value={this.getSetting('showTyping')}
              />
              <Text style={{ display: 'flex', flex: 0.1 }}>xx</Text>
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
              After you start Slacker, see notification area for updates.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.help}>
              Use one of the methods described
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(tokenHelpLink)}> here </Text>
                to get a Token.
              </Text>

          </ScrollView>
        }
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
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
  },
  switchContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
});


export default App;
