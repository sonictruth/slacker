import React from 'react';

import {
  ListItem,
  Avatar,
} from 'react-native-elements';

import Icon from 'react-native-vector-icons/FontAwesome';

import {
  Linking,
  ToastAndroid,
  FlatList,
  StyleSheet,
} from 'react-native';

import logTypes from './logTypes';

function getIcon(data) {

  const logType = data[0];
  const size = 40;

  switch (logType) {
    case logTypes.CONNECTED:
      return <Icon name='bolt' style={{ width: size }} size={size} color="darkgreen" />;
    case logTypes.CONNECTING:
      return <Icon name='sign-in' style={{ width: size }} size={size} color="darkgreen" />;
    case logTypes.DISCONNECTING:
      return <Icon name='sign-out' style={{ width: size }} size={size} color="darkgreen" />;
    case logTypes.NOTIFICATION:
      const notification = data[2];
      const avatarUri = notification.avatarImage;

      return <Avatar style={{ width: size, height: size }} source={{ uri: avatarUri }} />;
    case logTypes.ERROR:
      return <Icon name='exclamation-circle' style={{ width: size }} size={size} color="darkred" />;
    default:
      return <Icon name='cog' style={{ width: size }} size={size} />;
  }

}

function getContent(item) {
  const logType = item.data[0];
  const notification = item.data[2];
  const date = formatDate(item.id);
  const title = logType === logTypes.NOTIFICATION ?
    `${notification.title} : ${notification.subtitle}` : logType;
  const subtitle = logType === logTypes.NOTIFICATION ?
    notification.content : item.data[1];
  ;
  return (
    <ListItem.Content>
      <ListItem.Title>{date} {title}</ListItem.Title>
      <ListItem.Subtitle>{subtitle}</ListItem.Subtitle>
    </ListItem.Content>
  );
}

function formatDate(timestamp) {
  return (new Date(parseInt(timestamp))).toLocaleTimeString();
}

async function handleItemPress(item) {
  const logType = item.data[0];

  if (logType === logTypes.NOTIFICATION) {
    const notification = item.data[2];
    const channel = notification.channel;
    const content = notification.content;
    const launchUri = notification.launchUri;
    const supported = await Linking.canOpenURL(launchUri);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`https://slack.com/app_redirect?channel=${channel}`);
    }  
   
  } else {
    ToastAndroid.showWithGravity(
      'Press on a message to open slack',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  }

}

function LogViewr(props) {

  return (
    <>
      <FlatList
        style={styles.list}
        data={props.data}
        renderItem={
          ({ item }) =>
            <ListItem onPress={() => handleItemPress(item)} key={item.id} bottomDivider>
              {getIcon(item.data)}
              {getContent(item)}

            </ListItem>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
  }
});

export default LogViewr;
