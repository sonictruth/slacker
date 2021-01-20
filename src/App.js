import React from 'react';

import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Linking,
  Switch
} from 'react-native';

import {
  CheckBox,
  Divider,
  Text,
  Input,
  Button
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        showTyping: this.getSetting('showTyping'),
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
              <View  >
                <Image
                  style={styles.logo}
                  source={require('../icon.png')}
                />
              </View>
              <View  >
                <Text h1>Slacker</Text>
              </View>
            </View>

            <Divider />

            <Divider style={styles.divider} />

            <Text style={styles.help}>
              Use one of the methods described
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(tokenHelpLink)}> here </Text>
                to get a Token.
              </Text>

            <Divider style={styles.divider} />

            <Input
              disabled={this.state.serviceRunning}
              placeholder={'Paste Slack Token Here'}
              textContentType={'password'}
              secureTextEntry={true}
              autoCorrect={false}
              value={this.getSetting('token')}
              onChangeText={
                token => this.updateSetting('token', token)
              }
              leftIcon={
                <Icon
                  name='lock'
                  size={24}
                  color='black'
                />
              }
            />

            <CheckBox
              title={`Show 'Typing' on mentions or private messages`}
              checked={this.getSetting('showTyping')}
              onPress={() => this.updateSetting('showTyping', !this.getSetting('showTyping'))}
            />

            <Divider style={styles.divider} />

            <Button
              disabled={this.getSetting('token') === ''}
              style={styles.button}
              onPress={this.toggleBackground}
              title={
                this.state.serviceRunning ? ' Stop' : ' Start'
              }
              icon={
                <Icon
                  name={this.state.serviceRunning ? 'stop' : 'play'}
                  color='white'
                />}
            />

            <Divider style={styles.divider} />

            <Text style={styles.help}>
              After you start Slacker, check notification area for updates.
            </Text>


          </ScrollView>
        }
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    margin: 10,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  logo: {
    width: 70,
    height: 50,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    width: 100,
    margin: 20,
  },
  divider: {
    backgroundColor: 'transparent',
    margin: 10,
  },
  link: {
    color: 'blue',
  },
});


export default App;
