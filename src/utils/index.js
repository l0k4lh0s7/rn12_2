import {Dimensions, Alert, Platform} from 'react-native';

import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import I18n from '../services/translation';
import {getRealm} from '../services/realm';
import ReactNativeAN from 'react-native-alarm-notification';
import BackgroundTimer from 'react-native-background-timer';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import {ObjectId} from 'bson';


const updateTaskNotifIds = async (taskId, notifIds) => {
  const realm = await getRealm();
  if (realm) {
    realm.write(() => {
      const foundTask = realm.objectForPrimaryKey('Task', taskId);
      foundTask.alarmNotifIds = notifIds;
    });
  }
};

const updateExamNotifIds = async (examId, notifIds) => {
  const realm = await getRealm();
  if (realm){
    realm.write(() => {
      const foundExam = realm.objectForPrimaryKey('Exams', examId);
      foundExam.notificationIds = notifIds;
    });
  }
};


const filterDuplicateCourseNotifsTime = notifications => {
  const filteredNotifs = [];
  let duplicateFound = false;
  for (let i = 0, len = notifications.length; i < len; i++){
    duplicateFound = false;
    if (i === 0){
      filteredNotifs.push(notifications[i]);
      continue;
    } else {
      for (let j = 0, len2 = filteredNotifs.length; j < len2; j++){
        if (
          filteredNotifs[j].fireMinute === notifications[i].fireMinute
          &&
          filteredNotifs[j].fireHour === notifications[i].fireHour
        ){
          duplicateFound = true;
          break;
        }
      }
      if (!duplicateFound) filteredNotifs.push(notifications[i]);
    }
  }
  return filteredNotifs;
}

export const updateCourseNotification = async (courseId, repeatingNotification, callback) => {
  const realm = await getRealm();
  if (realm){
    realm.write(() => {
      const course = realm.objectForPrimaryKey('Course', ObjectId(courseId));
      const notificationsStudy = [];

      // Create a copy to avoid realm errors
      const notifications = JSON.parse(JSON.stringify(course.notificationsStudy));

      notifications.forEach(notif => {
        if (notif.id === repeatingNotification.id){
          notificationsStudy.push(repeatingNotification);
        } else {
          notificationsStudy.push(notif);
        }
      });
      course.notificationsStudy = notificationsStudy;
    });
  }

  if (callback && (typeof callback === 'function')){
    callback();
  }
}

export const isNetworkAvailable = async _ => {
  const status = await NetInfo.fetch();
  return status.isConnected && status.isInternetReachable;
};

export const unscheduleCourseNotification = async (courseNotification, callback) => {
  const notifications = courseNotification.notifications;

  for (let i = 0, len = notifications.length; i < len; i++){
    if (notifications[i].notificationId){
      ReactNativeAN.deleteRepeatingAlarm(notifications[i].notificationId);
    }
  }

  if (callback && (typeof callback === 'function')){
    callback();
  }
}

export const scheduleCourseNotification = (courseId, repeatingNotification, callback, updateCallback) => {
  const newNotifications = [];
  const notifications = filterDuplicateCourseNotifsTime(repeatingNotification.notifications);
  const count = notifications.length;
  let counter = 0;

  if (Platform.OS === 'ios') BackgroundTimer.start();

  const backgroundTimer = BackgroundTimer.setInterval(async _ => {
    try {
      const notification = notifications[counter];
      
      const date = new Date();
      const fireDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        notification.fireHour,
        notification.fireMinute, 0
      );

      if (fireDate < new Date()){
        fireDate.setDate(fireDate.getDate() + 1);
      }

      const notifData = {
        title: 'Course Notification',
        message: repeatingNotification.title,
        large_icon: 'large_icon',
        channel: 'NotificationChannel',
        small_icon: 'ic_launcher',
        color: 'black',
        auto_cancel: true,
        schedule_type: 'repeat',
        repeat_interval: 'daily',
        has_button: false,
        loop_sound: false,
        play_sound: true,
        sound_name: 'notification_test.mp3',
        data: {fireDate: fireDate},
      };

      const scheduleResponse = await ReactNativeAN.scheduleAlarm({
        ...notifData,
        fire_date: moment(fireDate).format('DD-MM-YYYY HH:mm:ss'),
      });
      
      notification.notificationId = parseInt(scheduleResponse.id);

      newNotifications.push(notification);

      counter += 1;
      
      if (counter === count){
        repeatingNotification.notifications = newNotifications;
        updateCourseNotification(courseId, repeatingNotification, updateCallback);
        BackgroundTimer.clearInterval(backgroundTimer);
        if (Platform.OS === 'ios') BackgroundTimer.stop();
      }
    } catch (error) {
      if (error.message.includes('fire date is in the past')) {
        Alert.alert('Time cannot be in the past');
      } else {
        console.log('ERR', error);
      }
      BackgroundTimer.clearInterval(backgroundTimer);
      if (Platform.OS === 'ios') BackgroundTimer.stop();
    }
  }, count > 1 ? 1000 : 0);

  if (callback && (typeof callback === 'function')){
    callback();
  }
}

export const scheduleExamNotif = async (examData, isDelete, callback) => {
  // If is updating
  if (examData.notificationIds && examData.notificationIds.length > 0) {
    const notifIds = [...examData.notificationIds];
    const allNotifs = await ReactNativeAN.getScheduledAlarms();
    const allNotifIds = allNotifs.map(notif => parseInt(notif.id));

    const matchingIds = allNotifIds.filter(id => notifIds.includes(id));

    for (let i = 0, len = matchingIds.length; i < len; i++) {
      try {
        ReactNativeAN.deleteAlarm(matchingIds[i]);
      } catch (error) {
        console.log('ERROR REMOVING ALARM =>', error);
        return;
      }
    }
    // IMPORTANT: Reset old notification ids
    examData.notificationIds = [];
  }

  if (isDelete === true) {
    callback(examData);
    return;
  }

  try {
    const examNotifData = {
      title: 'Exam Notification',
      message: `${examData.courseName} - ${examData.courseTopic}`,
      large_icon: 'large_icon',
      channel: 'NotificationChannel',
      small_icon: 'ic_launcher',
      color: 'black',
      auto_cancel: true,
      schedule_type: 'once',
      has_button: false,
      loop_sound: false,
      play_sound: true,
      sound_name: 'notification_test.mp3',
      data: {examId: examData._id},
    };

    const fireDates = examData.notifFireDatesInMillis.map(millis => {
      return moment(millis).format(
        'DD-MM-YYYY HH:mm:ss',
      );
    });

    if (fireDates.length > 1){
        BackgroundTimer.start();
        let notifCounter = 0;
        const notifLength = fireDates.length;
        const examNotifIds = [];
        const intervalId = BackgroundTimer.setInterval(async _ => {
          const notif = await ReactNativeAN.scheduleAlarm({
            ...examNotifData,
            fire_date: fireDates[notifCounter],
          });
          examNotifIds.push(parseInt(notif.id));
          notifCounter++;
          if (notifCounter >= notifLength){
            BackgroundTimer.clearInterval(intervalId);
            examData.notificationIds = examNotifIds;
            updateExamNotifIds(examData._id, examNotifIds);
            BackgroundTimer.stop();
          }
        }, 1000);
    } else if (fireDates.length === 1){
      const notif = await ReactNativeAN.scheduleAlarm({
        ...examNotifData,
        fire_date: fireDates[0],
      });
      examData.notificationIds = [parseInt(notif.id)];
    } else {
      Alert.alert("Please set at least one exam reminder date");
      return;
    }
    callback(examData);
  } catch (error) {
    if (error.message.includes('fire date is in the past')) {
      Alert.alert('Date or time cannot be in the past');
    } else {
      console.log('ERR', error);
    }
  }
};

export const scheduleAlarmNofit = async (data, subtArr, callback) => {
  const alarmNotifData = {
    title: data.mode === 1 ? 'Task Alarm' : 'Task Notification',
    message: data.name,
    large_icon: 'large_icon',
    channel: 'NotificationChannel',
    small_icon: 'ic_launcher',
    color: 'black',
    auto_cancel: data.mode === 1 ? false : true,
    schedule_type: 'once',
    has_button: data.mode === 1 ? true : false,
    loop_sound: data.mode === 1 ? true : false,
    play_sound: true,
    sound_name: 'notification_test.mp3',
    data: {taskId: data.id},
  };

  const fireMonth =
    (data.soundMonth + 1).toString().length < 2
      ? `0${data.soundMonth + 1}`
      : data.soundMonth + 1;
  const fireDay =
    data.soundDay.toString().length < 2 ? `0${data.soundDay}` : data.soundDay;
  const fireHour =
    data.soundHour.toString().length < 2
      ? `0${data.soundHour}`
      : data.soundHour;
  const fireMinute =
    data.soundMinute.toString().length < 2
      ? `0${data.soundMinute}`
      : data.soundMinute;

  const fireDate = `${data.soundYear}-${fireMonth}-${fireDay} ${fireHour}:${fireMinute}:00`;
  
  // Check if date/time is not in the past
  try {
    const alarmNotif = await ReactNativeAN.scheduleAlarm({
      ...alarmNotifData,
      fire_date: moment(moment(fireDate).unix() * 1000).format(
        'DD-MM-YYYY HH:mm:ss',
      ),
    });
    ReactNativeAN.deleteAlarm(parseInt(alarmNotif.id));
  } catch (error) {
    if (error.message.includes('fire date is in the past')) {
      Alert.alert('Task cannot be in the past');
    } else {
      console.log('ERR', error);
    }
    return;
  }

  // Remove all old scheduled notifications
  if (data.alarmNotifIds.length > 0) {
    const mIds = [...data.alarmNotifIds];

    const alarms = await ReactNativeAN.getScheduledAlarms();

    const alarmIds = alarms.map(alarm => parseInt(alarm.id));
    const matchingIds = alarmIds.filter(id => mIds.includes(id));

    for (let i = 0, len = matchingIds.length; i < len; i++) {
      try {
        ReactNativeAN.deleteAlarm(matchingIds[i]);
      } catch (error) {
        console.log('ERROR REMOVING ALARM =>', error);
        return;
      }
    }
    // IMPORTANT: Reset old alarm IDs
    data.alarmNotifIds = [];
  }

  try {
    // If it's alarm mode in iOS
    if (data.mode === 1 && Platform.OS === 'ios') {
      await ReactNativeAN.scheduleAlarm({
        ...alarmNotifData,
        // Set exact date time | Format: DD-MM-YYYY HH:mm:ss
        fire_date: moment(moment(fireDate).unix() * 1000).format(
          'DD-MM-YYYY HH:mm:ss',
        ),
      });

      const unixTime = moment(fireDate).unix();
      let repeatCount = 0;
      const notifIds = [];
      BackgroundTimer.start();
      const myTimer = BackgroundTimer.setInterval(async _ => {
        try {
          repeatCount++;
          const alarmNotif = await ReactNativeAN.scheduleAlarm({
            ...alarmNotifData,
            // Set exact date time | Format: DD-MM-YYYY HH:mm:ss
            fire_date: moment((unixTime + repeatCount * 9) * 1000).format(
              'DD-MM-YYYY HH:mm:ss',
            ),
          });
          notifIds.push(parseInt(alarmNotif.id));
          if (repeatCount === 9 || unixTime <= Date.now() / 1000) {
            updateTaskNotifIds(data._id, notifIds);
            BackgroundTimer.clearInterval(myTimer);
            BackgroundTimer.stop();
          }
        } catch (error) {
          console.info('TIMER ERR =>', error);
          BackgroundTimer.clearInterval(myTimer);
          BackgroundTimer.start();
        }
      }, 1000);
    } else {
      const alarmNotif = await ReactNativeAN.scheduleAlarm({
        ...alarmNotifData,
        // Set exact date time | Format: DD-MM-YYYY HH:mm:ss
        fire_date: moment(moment(fireDate).unix() * 1000).format(
          'DD-MM-YYYY HH:mm:ss',
        ),
      });
      data.alarmNotifIds = [parseInt(alarmNotif.id)];
    }
    callback(data);
  } catch (error) {
    if (error.message.includes('fire date is in the past')) {
      Alert.alert('Task cannot be in the past');
    } else {
      console.log('ERR', error);
    }
  }
};

export const isEmpty = str => {
  return (
    str === undefined ||
    str === null ||
    (typeof str === 'string' && str.replaceAll(' ', '').length < 1)
  );
};

export const responsive = () => {
  const windowWidth = Dimensions.get('window').width;
  if (windowWidth === 320) {
    return 'small';
  } else if (windowWidth === 414) {
    return 'large';
  }
  return 'medium';
};

export const storeSettingsEncryptedData = async (storageKey, value) => {
  try {
    await EncryptedStorage.setItem(storageKey, value);
  } catch (error) {
    console.log('ERR', error);
  }
};

export const getSettingsEncryptedData = async (storageKey, callback) => {
  try {
    const foundValue = await EncryptedStorage.getItem(storageKey);
    callback(foundValue);
  } catch (error) {
    console.log('ERR', error);
  }
};

export const removeSettingsEncryptedData = async storageKey => {
  try {
    const removed = await EncryptedStorage.removeItem(storageKey);

    if (removed) {
      console.log('eliminado');
    } else {
      console.log('auh no');
    }
  } catch (error) {
    console.log('ERR', error);
  }
};

export const storeSettingsData = async (storageKey, value) => {
  try {
    console.info(storageKey, ':', value);
    await AsyncStorage.setItem(storageKey, value);
  } catch (error) {
    console.log('ERR', error);
  }
};

export const getSettingsData = async (storageKey, callback) => {
  try {
    const foundValue = await AsyncStorage.getItem(storageKey);
    callback(foundValue);
  } catch (error) {
    console.log('ERR', error);
  }
};

export const removeSettingsData = async storageKey => {
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.log('ERR', error);
  }
};

export const showAyncStorageData = async () => {
  let keys = [];
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch (e) {
    // read key error
  }

  console.log(keys);
};

// export const storeMultiData = async (storageKey, arrayKeys) => {
//   try {
//     await AsyncStorage.multiSet()
//   } catch (error) {
//   }
// }

export const handleSound = sound => {
  Sound.setCategory('Playback');
  var whoosh = new Sound(sound, error => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    whoosh.setVolume(2);
    whoosh.play();
  });
};

export const handleReadableDate = (hour, minute) => {
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);

  return moment(date).format('hh:mm A');
};

export const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n - 1) + '...' : str;
};

export const courseColors = [
  {color1: '#007CE0', color2: '#00DAC2', position: 0},
  {color1: '#1907BC', color2: '#8013BD', position: 1},
  {color1: '#F8404C', color2: '#FD2E92', position: 2},
  {color1: '#F747E5', color2: '#7647FC', position: 3},
  {color1: '#0031E0', color2: '#021195', position: 4},
  {color1: '#BD00FF', color2: '#2C0057', position: 5},
  {color1: '#FF7532', color2: '#E8207A', position: 6},
  {color1: '#00FFC1', color2: '#02E3C5', position: 7},
];

export const routinesColors = [
  {color1: '#0B6DF6', color2: '#003BDC', position: 0},
  {color1: '#7A0DE5', color2: '#BE2DFD', position: 1},
  {color1: '#FF7D34', color2: '#FFAD80', position: 2},
  {color1: '#00FFC1', color2: '#1E95A8', position: 3},
  {color1: '#A1D8F7', color2: '#003BDC', position: 4},
  {color1: '#FF0085', color2: '#D55CFF', position: 5},
  {color1: '#FF7532', color2: '#E8207A', position: 6},
  {color1: '#00FFC1', color2: '#02E3C5', position: 7},
];

export const classColors = [
  {color: '#CF271E', position: 0},
  {color: '#FB3A2F', position: 1},
  {color: '#A651BB', position: 2},
  {color: '#993BB3', position: 3},
  {color: '#0081BE', position: 4},
  {color: '#0099E0', position: 5},
  {color: '#00C099', position: 6},
  {color: '#01A285', position: 7},
  {color: '#00B257', position: 8},
  {color: '#00D066', position: 9},
  {color: '#F9C301', position: 10},
  {color: '#FE9801', position: 11},
  {color: '#F47800', position: 12},
  {color: '#E34900', position: 13},
  {color: '#EBF0F1', position: 14},
  {color: '#BCC3C7', position: 15},
  {color: '#91A6A6', position: 16},
  {color: '#7B8D8D', position: 17},
  {color: '#2D4960', position: 18},
  {color: '#273F51', position: 19},
  {color: '#6D4C41', position: 20},
  {color: '#455A64', position: 21},
];

export const icons = [
  {iconCode: 'bus', name: 'bus'},
  {iconCode: 'cake', name: 'cake'},
  {iconCode: 'cards-heart', name: 'heart'},
  {iconCode: 'cart', name: 'cart'},
  {iconCode: 'carrot', name: 'carrot'},
  {iconCode: 'cash-multiple', name: 'cash'},
  {iconCode: 'cellphone', name: 'phone'},
  {iconCode: 'chat', name: 'chat'},
  {iconCode: 'chef-hat', name: 'chef'},
  {iconCode: 'church', name: 'church'},
  {iconCode: 'cigar-off', name: 'cigar'},
  {iconCode: 'console', name: 'console'},
];

export const tasksSortSelector = [
  {label: I18n.t('sortTime'), value: '0'},
  {label: I18n.t('sortImportance'), value: '1'},
];

export const sortOrder = ['#F22C50', '#FFD25F', '#14D378'];

export const alarmOrNotificationOptions = [
  {label: I18n.t('notification'), value: 0},
  {label: I18n.t('alarm'), value: 1},
];

export const importanceAndColorOptions = [
  {label: 'Low', value: '#14D378', activeColor: '#14D378'},
  {label: 'Half', value: '#FFD25F', activeColor: '#FFD25F'},
  {label: 'High', value: '#F22C50', activeColor: '#F22C50'},
];

export const notificationsRepetition = [
  {label: '1', value: 1},
  {label: '2', value: 2},
  {label: '3', value: 3},
  // {label: '4', value: 4},
  // {label: '5', value: 5},
];

// export const handleNotification = (title, msm) => {
//   PushNotification.localNotification({
//     title: title,
//     message: msm,
//   });
// };

// export const handleFuturePushNotification = function (
//   title,
//   msm,
//   year,
//   month,
//   day,
//   hour,
//   minute,
//   second,
// ) {
//   PushNotification.localNotificationSchedule({
//     title: title,
//     message: msm,
//     date: new Date(year, month, day, hour, minute),
//     playSound: true,
//     // soundName: 'alarm_sound.mp3',
//   });
// };

// export const handleFuturePushNotificationAndAsyncStorageSystem = function (
//   title,
//   msm,
//   year,
//   month,
//   day,
//   hour,
//   minute,
//   second,
//   storageKeyTEST,
//   valueTEST,
// ) {
//   PushNotification.localNotificationSchedule({
//     title: title,
//     message: msm,
//     date: new Date(year, month, day, hour, minute, second),
//   });
//   console.log('ALARMITA'); //con esto conpruebo que no pasa esto despues de que suene la alarma
//   // storeSettingsData(storageKeyTEST, valueTEST);
//   //asyncstorage('notifPendiente', 'id de task');, si al abir la aplicacion esta notifPendiente Y ES LA HORA ACTUAL DE LA ALARMA, entonces mira cual es el id, buscalo, traelo de la DB, abri el modal y mostra sus datos, tambein con la alarm si esta la alarma entonces navigation.navigate('apagarAlarma') igual con el pomoTask navigation.navigate('pomodoro');
// };

export const showAlert = (
  alertTitle,
  alertBody,
  cancelFunction,
  destructiveFunction,
  customText,
  customTextValue,
) =>
  Alert.alert(alertTitle, alertBody, [
    {text: 'Cancelar', style: 'cancel', onPress: () => cancelFunction()},
    {
      text: customText ? customTextValue : 'Eliminar',
      style: customText ? 'default' : 'destructive',
      onPress: () => destructiveFunction(),
    },
  ]);

export const handleRealmSaveData = () => {};

