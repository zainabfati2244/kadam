import 'react-native-gesture-handler';

/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { storeNotification } from './src/services/firebase';
import App from './App';
import { name as appName } from './app.json';

setBackgroundMessageHandler(getMessaging(), async message => {
  const user = getAuth().currentUser;
  if (user) await storeNotification(user.uid, { title: message.notification?.title, body: message.notification?.body, messageId: message.messageId });
});

AppRegistry.registerComponent(appName, () => App);
