/**
 * @format
 */
import 'react-native-gesture-handler';
import {
  AppRegistry,
  Platform // Added by Daniel
} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

import { CacheManager } from '@georstat/react-native-image-cache';
import { Dirs } from 'react-native-file-access';

CacheManager.config = {
  baseDir: `${Dirs.CacheDir}/images_cache/`,
  blurRadius: 15,
  sourceAnimationDuration: 100,
  thumbnailAnimationDuration: 1000,
};

// Added by Daniel
import ReactNativeAN from 'react-native-alarm-notification';

/* Added by Daniel
 * Check and request nofication permission
 */
if (Platform.OS === 'ios'){
  /* Check iOS nofication permission */
  ReactNativeAN.checkPermissions((permissions) => {
    if (
      !permissions.alert
      || !permissions.badge
      || !permissions.lockScreen
      || !permissions.notificationCenter
      || !permissions.sound
    ){
      /* Request iOS permissions */ 
      ReactNativeAN.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
        lockScreen: true,
        notificationCenter: true
      }).then(successData => {
          console.log('RnAlarmNotification.requestPermissions', successData);
        },
        errorData => {
          Alert.alert('Notification is required for app\'s to functionality');
          console.log('RnAlarmNotification.requestPermissions failed', errorData);
        }
      );
    }
  });

}

// All commented out by Daniel
/*
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';


// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log('primer plano?????', notification.foreground);
    console.log('la toco????:', notification.userInteraction);

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  // /**
  //  * (optional) default: true
  //  * - Specified if permissions (ios) and token (android and ios) will requested or not,
  //  * - if not, you must call PushNotificationsHandler.requestPermissions() later
  //  * - if you are not using remote notification or do not have Firebase installed, use this:
  //  *     requestPermissions: Platform.OS === 'ios'
  //  /
  requestPermissions: Platform.OS === 'ios',
});
*/

AppRegistry.registerComponent(appName, () => App);
