import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  Animated,
  Text,
  TouchableHighlight,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';

import RealmContext from '../../contexts/RealmContext';

import {ObjectId} from 'bson';
import {v4 as uuidv4} from 'uuid';

import I18n from '../../services/translation';

import {getRealm, getRealmApp} from '../../services/realm';

import {useTheme} from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

import BottomModal from '../BottomModal';
import CreateEditTask from '../BottomModal/CreateEditContent';

import Swipeable from 'react-native-swipeable';

import SettingsOptionsContext from '../../contexts/SettingsOptionsContext';

import DoneTaskSound from '../../../assets/audio/notification_test.mp3';

import {
  responsive,
  handleReadableDate,
  truncate,
  handleSound,
  scheduleAlarmNofit,
} from '../../utils';

import ReactNativeAN from 'react-native-alarm-notification';

const size = responsive();

const FlatlistTasks = ({
  flatlistData,
  flatlistDataChange,
  yearReceived,
  monthReceived,
  dayReceived,
  tasksInRoutines,
  routine_id,
  other_user_routine,
}) => {
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const {colors} = useTheme();

  const editTaskrefBottomModalTEST = useRef();
  const [taskToUpdate, setTaskToUpdate] = useState('');

  const [userSubtasks, setUserSubtasks] = useState([]);

  //MODAL CREATE & UPDATE TASK STATES
  const [inputNameTask, setInputNameTask] = useState('');
  const [taskAlarmNotifIds, setTaskAlarmNotifIds] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#2ED27C');
  const [alarm, setAlarm] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('');

  //STATES CON VALOR DE LA HORA EN LA QUE SONARA EL TASK Y LA MOSTRARAN POR DEFECTO EN EL DATETIMEPICKER
  const [taskHour, setTaskHour] = useState(0);
  const [taskMinute, setTaskMinute] = useState(0);

  const [swipeableTasksOn, setSwipeableTasksOn] = useState(false);

  const [doneTask, setDoneTask] = useState(false);

  const [modalDoneTaskVisible, setModalDoneTaskVisible] = useState(false);
  const [shotAnimation, setShotAnimation] = useState(false);

  const [deletedTask, setDeletedTask] = useState(false);

  const {soundDone} = useContext(SettingsOptionsContext);

  const tasksOpacity = useRef(new Animated.Value(0)).current;

  const handleAnimation = () => {
    setShotAnimation(true);
    handleSound(DoneTaskSound);
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(tasksOpacity, {
        toValue: 0,
        useNativeDriver: true,
        duration: 0,
      }),
      Animated.timing(tasksOpacity, {
        toValue: 1,
        useNativeDriver: true,
        duration: 400,
      }),
    ]).start();
  }, [tasksOpacity, flatlistData, deletedTask]);

  const handleUpdateAndSaveTask = async (
    t,
    c,
    aOrn,
    hr,
    mn,
    i,
    pom,
    filt,
    subtArr,
    oldAlarmNotifIds,
  ) => {
    const foundTaskToUpdate = realm.objectForPrimaryKey('Task', taskToUpdate);
    
    console.log('FOOOOOUND___', foundTaskToUpdate);

    if (!foundTaskToUpdate){
      editTaskrefBottomModalTEST.current.close();
      return;
    }

    try {
      const permissionCallback = (mData) => {
        realm.write(() => {
          if (mData){
            foundTaskToUpdate.alarmNotifIds = mData.alarmNotifIds;
          }

          foundTaskToUpdate.name = t;
          foundTaskToUpdate.color = c;
          foundTaskToUpdate.mode = aOrn;
          foundTaskToUpdate.done = false;
          foundTaskToUpdate.icon = i;
          foundTaskToUpdate.pomodoro = pom;
          foundTaskToUpdate.filter = filt;
          foundTaskToUpdate.subtasks = subtArr;
          // foundTaskToUpdate.soundYear = yearReceived;
          // foundTaskToUpdate.soundMonth = monthReceived;
          // foundTaskToUpdate.soundDay = dayReceived;
          foundTaskToUpdate.soundHour = hr;
          foundTaskToUpdate.soundMinute = mn;

          // const data = realm
          //   .objects('Task')
          //   .filtered(
          //     `soundDay == ${dayReceived} AND soundMonth == ${monthReceived} AND soundYear == ${yearReceived}`,
          //   );
        });
        editTaskrefBottomModalTEST.current.close();
        flatlistDataChange(true);
      };

      if (foundTaskToUpdate.soundYear === 0 
        && foundTaskToUpdate.soundMonth === 0 
        && foundTaskToUpdate.soundDay === 0
      ){
        permissionCallback();
        return;
      }

      const updatedTaskData = {
        _id: ObjectId(taskToUpdate),
        alarmNotifIds: oldAlarmNotifIds, 
        name: t,
        color: c,
        mode: aOrn,
        done: false,
        icon: i,
        pomodoro: pom,
        filter: filt,
        soundYear: yearReceived,
        soundMonth: monthReceived,
        soundDay: dayReceived,
        soundHour: hr,
        soundMinute: mn,
      };
      // console.log(updatedTaskData);

      if (Platform.OS === 'ios') {
        /* Check iOS nofication permission */
        ReactNativeAN.checkPermissions(permissions => {
          if (
            !permissions.alert ||
            !permissions.badge ||
            !permissions.lockScreen ||
            !permissions.notificationCenter ||
            !permissions.sound
          ) {
            /* Request iOS permissions */
            ReactNativeAN.requestPermissions({
              alert: true,
              badge: true,
              sound: true,
              lockScreen: true,
              notificationCenter: true,
            }).then(
              successData => {
                scheduleAlarmNofit(
                  updatedTaskData,
                  subtArr,
                  permissionCallback,
                );
              },
              errorData => {
                Alert.alert('Allow notifications before');
              },
            );
          } else {
            scheduleAlarmNofit(updatedTaskData, subtArr, permissionCallback);
          }
        });
      } else {
        scheduleAlarmNofit(updatedTaskData, subtArr, permissionCallback);
      }
    } catch (error) {
      if (error.message.includes('fire date is in the past')) {
        Alert.alert('Task cannot be in the past');
      } else {
        console.log('MERR', error);
      }
    }
  };

  const editTaskModalTEST = () => {
    return (
      <BottomModal
        openModal={editTaskrefBottomModalTEST}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        borderRadiusTop={40}
        keyBoardPushContent={false}
        closeDragDown={true}
        customPaddingHorizontal={true}
        content={
          <CreateEditTask
            modalTitle={I18n.t('editTask')}
            buttonSubmitText={I18n.t('update')}
            placeHolder={I18n.t('title')}
            passAllData={(
              txt,
              color,
              aOrn,
              h,
              m,
              icn,
              pom,
              filt,
              subtasksArr,
              oldAlarmNotifIds,
            ) => {
              handleUpdateAndSaveTask(
                txt,
                color,
                aOrn,
                h,
                m,
                icn,
                pom,
                filt,
                subtasksArr,
                oldAlarmNotifIds,
              );
            }}
            editModal={true}
            currentTaskName={inputNameTask}
            currentTaskAlarmNotifIds={taskAlarmNotifIds}
            currentTaskColor={selectedColor}
            currentTaskAlarmOrNotification={alarm}
            currentTaskYear={yearReceived}
            currentTaskMonth={monthReceived}
            currentTaskDay={dayReceived}
            currentTaskHour={taskHour}
            currentTaskMinute={taskMinute}
            currentTaskIcon={selectedIcon}
            currentSubtasks={userSubtasks}
            passCloseModal={value => {
              value ? editTaskrefBottomModalTEST.current.close() : null;
            }}
          />
        }
      />
    );
  };

  const handleDeleteTask = task => {
    realm.write(() => {
      const d = realm.objects('Task');
      const foundTasks = d ? d.filtered(`id == "${task.id}"`) : [];
      if (foundTasks.length < 1) return;
      const foundTask = foundTasks[0];
      for (let i = 0, len = task.alarmNotifIds.length; i < len; i++) {
        try {
          ReactNativeAN.deleteAlarm(task.alarmNotifIds[i]);
        } catch (error) {
          console.info('ERR UNSCHEDULING =>', error);
        }
      }
      realm.delete(foundTask);
    });
    const data = realm
      .objects('Task')
      .filtered(
        `soundDay == ${dayReceived} AND soundMonth == ${monthReceived} AND soundYear == ${yearReceived}`,
      );
    flatlistDataChange(true);
    // setUserTasks(data);
  };

  const handleDeleteTaskInRoutine = (taskId) => {
    try {
      console.log('id....', routine_id);
      realm.write(() => {
        const routineToDeleteTask = realm.objectForPrimaryKey(
          'Routine',
          ObjectId(routine_id),
        );

        console.log('foundrou', routineToDeleteTask);

        let removedTask = [];
        removedTask = routineToDeleteTask.tasks.filter(
          item => item.id !== taskId,
        );

        // routineToDeleteTask.tasks = [];

        console.log('REMOVEDTask', removedTask);

        let removedTask_helper = [];

        removedTask.map(item =>
          removedTask_helper.push({
            alarmNotifIds: [],
            color: item.color,
            done: item.done,
            filter: item.filter,
            icon: item.icon,
            id: item.id,
            mode: item.mode,
            name: item.name,
            pomodoro: item.pomodoro,
            soundYear: item.soundYear,
            soundMonth: item.soundMonth,
            soundDay: item.soundDay,
            soundHour: item.soundHour,
            soundMinute: item.soundMinute,
            subtasks: [],
            userID: realmApp.currentUser
              ? realmApp.currentUser.id
              : 'unknownUser',
          }),
        );

        console.log('removedTask_helper', removedTask_helper);

        routineToDeleteTask.tasks = removedTask_helper;

        // arrtest.push(routineToDeleteTask.tasks.filter((item) => item.id !== notiId))
        // console.log('arrtest', arrtest.map((item) => item))
      });
      flatlistDataChange(true);
    } catch (error) {
      console.log('ERR on DELETE TASK', error);
    }

    // setCourseNotifications(!courseNotifications);
  };

  let paddingBottomFlatlist;

  let todayTextSize;

  let plusMenuIconsContainerWidth;
  let plusMenuIconsSize;
  let iconTaskSize;
  let nameTaskSize;
  let iconListTaskSize;
  let modeTaskIconSize;
  let timeTaskSize;

  let paddingHorizontalTask;
  let paddingVerticalTask;

  if (size === 'small') {
    paddingBottomFlatlist = '77%';
    todayTextSize = 12;
    plusMenuIconsSize = 20;
    plusMenuIconsContainerWidth = '21%';

    paddingHorizontalTask = 35;
    paddingVerticalTask = 10;
    iconTaskSize = 35;
    nameTaskSize = 11;
    iconListTaskSize = 20;
    modeTaskIconSize = 12;
    timeTaskSize = 11;
  } else if (size === 'medium') {
    paddingBottomFlatlist = '81%';

    todayTextSize = 14;
    plusMenuIconsSize = 27;
    plusMenuIconsContainerWidth = '22%';

    paddingHorizontalTask = 37;
    paddingVerticalTask = 14;
    iconTaskSize = 47;
    nameTaskSize = 13;
    iconListTaskSize = 22;
    modeTaskIconSize = 14;
    timeTaskSize = 13;
  } else {
    paddingBottomFlatlist = '84%';

    todayTextSize = 18;
    plusMenuIconsSize = 32;
    plusMenuIconsContainerWidth = '23%';

    paddingHorizontalTask = 40;
    paddingVerticalTask = 16;
    iconTaskSize = 54;
    nameTaskSize = 15;
    iconListTaskSize = 22;
    modeTaskIconSize = 16;
    timeTaskSize = 15;
  }

  return (
    <Animated.FlatList
      data={flatlistData}
      keyExtractor={item => item._id}
      numColumns={1}
      style={{
        paddingBottom: paddingBottomFlatlist,
        // backgroundColor: 'gray',
        opacity: tasksOpacity,
      }}
      scrollEnabled={swipeableTasksOn ? false : true}
      renderItem={({item}) => (
        <Swipeable
          onSwipeStart={() => setSwipeableTasksOn(true)}
          onSwipeRelease={() => setSwipeableTasksOn(false)}
          leftButtonWidth={item.pomodoro ? 95 : null}
          leftButtons={
            tasksInRoutines
              ? null
              : item.pomodoro
              ? [
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#0B6DF6',
                      paddingVertical: paddingVerticalTask,
                      paddingHorizontal: 20,
                      borderRadius: 190,
                      marginTop: 20,
                      // marginRight: 15,
                      alignItems: 'flex-end',
                    }}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}>
                      <Ionicons
                        name="ios-checkmark-circle"
                        color="white"
                        size={iconTaskSize - 3}
                      />
                    </View>
                  </TouchableOpacity>,
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'lightblue',
                      paddingVertical: paddingVerticalTask,
                      paddingHorizontal: 20,
                      borderRadius: 190,
                      marginTop: 20,
                      // marginRight: 15,
                      alignItems: 'flex-end',
                    }}>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}>
                      <MaterialCommunityIcons
                        name="progress-clock"
                        color="white"
                        size={iconTaskSize + 1}
                      />
                    </View>
                  </TouchableOpacity>,
                ]
              : null
          }
          leftActionActivationDistance={item.pomodoro ? null : 100}
          onLeftActionRelease={
            item.pomodoro
              ? () => {}
              : async () => {
                  item.done === false && soundDone ? handleAnimation() : null;
                  const realm = await getRealm();

                  if (item.done === false) {
                    setModalDoneTaskVisible(true);
                  }

                  setDoneTask(!doneTask);
                  realm.write(() => {
                    realm.create(
                      'Task',
                      {id: item.id, done: !item.done},
                      'modified',
                    );
                  });
                  flatlistDataChange(true);
                }
          }
          leftContent={
            tasksInRoutines ? null : item.pomodoro ? null : (
              <TouchableHighlight
                style={{
                  backgroundColor: '#0B6DF6',
                  paddingVertical: paddingVerticalTask,
                  paddingHorizontal: paddingHorizontalTask,
                  borderRadius: 190,
                  marginTop: 20,
                  // marginRight: 15,
                  alignItems: 'flex-end',
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                  <Ionicons
                    name="ios-checkmark-circle"
                    color="white"
                    size={iconTaskSize - 3}
                  />
                </View>
              </TouchableHighlight>
            )
          }
          rightActionActivationDistance={100}
          onRightActionRelease={() =>
            other_user_routine
              ? null
              : Alert.alert(
                  I18n.t('deleteTask'),
                  'Deseas eliminar la tarea permanentemente',
                  [
                    {
                      text: 'Eliminar',
                      onPress: async () => {
                        tasksInRoutines
                          ? handleDeleteTaskInRoutine(item.id)
                          : handleDeleteTask(item);
                      },
                    },
                    {
                      text: 'Cancelar',
                      onPress: () => console.log('cancelado'),
                    },
                  ],
                )
          }
          rightContent={
            other_user_routine ? null : (
              <TouchableHighlight
                style={{
                  backgroundColor: '#FE354B',
                  paddingVertical: paddingVerticalTask,
                  paddingHorizontal: paddingHorizontalTask,
                  borderRadius: 190,
                  marginTop: 20,
                  // marginLeft: 1,
                }}>
                <MaterialCommunityIcons
                  name="delete-circle"
                  color="white"
                  size={iconTaskSize}
                />
              </TouchableHighlight>
            )
          }>
          <TouchableOpacity
            onPress={() => {
              console.info(item)
              setTaskToUpdate(item._id);
              setInputNameTask(item.name);
              setTaskAlarmNotifIds(item.alarmNotifIds);
              setSelectedColor(item.color);
              setAlarm(item.mode);
              setTaskHour(item.soundHour);
              setTaskMinute(item.soundMinute);
              setSelectedIcon(item.icon);
              setUserSubtasks(item.subtasks);
              editTaskrefBottomModalTEST.current.open();
            }}>
            <View
              style={{
                backgroundColor: item.done ? '#EDEBEA' : item.color,
                paddingVertical: paddingVerticalTask,
                paddingHorizontal: paddingHorizontalTask,
                borderRadius: 190,
                marginTop: 20,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '87%',
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={iconTaskSize}
                  color="white"
                />
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginLeft: 10,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: nameTaskSize,
                    }}>
                    {item.subtasks?.length > 0
                      ? truncate(item.name, 22)
                      : truncate(item.name, 30)}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 2,
                    }}>
                    <Ionicons
                      name={item.mode === 0 ? 'notifications' : 'alarm'}
                      color="white"
                      size={modeTaskIconSize}
                    />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: timeTaskSize,
                      }}>
                      {handleReadableDate(item.soundHour, item.soundMinute)}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                {item.filter ? (
                  <MaterialCommunityIcons
                    name={item.filter.icon}
                    color="white"
                    size={iconListTaskSize}
                  />
                ) : item.pomodoro ? (
                  <MaterialCommunityIcons
                    name="progress-clock"
                    color="white"
                    size={iconListTaskSize}
                  />
                ) : null}
                {item.subtasks?.length > 0 ? (
                  <Entypo
                    name="flow-cascade"
                    color="white"
                    size={iconListTaskSize}
                  />
                ) : item.pomodoro ? (
                  <MaterialCommunityIcons
                    name="progress-clock"
                    color="white"
                    size={iconListTaskSize}
                  />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
          {editTaskModalTEST()}
        </Swipeable>
      )}
    />
  );
};

export default FlatlistTasks;
