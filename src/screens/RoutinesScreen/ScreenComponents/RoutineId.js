/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';

import RealmContext from '../../../contexts/RealmContext';

import I18n from '../../../services/translation';
import {getRealm} from '../../../services/realm';

import {ObjectId} from 'bson';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import Button from '../../../components/Button';
import AddButton from '../../../components/AddButton';
import BottomModal from '../../../components/BottomModal';
import CreateEditTask from '../../../components/BottomModal/CreateEditContent';
import FlatListTasks from '../../../components/Task/flatlistTasks';

import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '@react-navigation/native';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import {responsive, routinesColors, handleReadableDate} from '../../../utils';

// import {Typography} from '../../../styles';

const size = responsive();

const RoutineId = ({route, navigation}) => {
  const {
    routine,
    routineName,
    routineDescription,
    color_position,
    routineTasks,
    idRoutine,
    otherUserRoutine,
    userCreatorUserName,
    userCreatorImgProfile,
    userCreatorFirstName,
    userCreatorLastName,
    imStudy,
  } = route.params;
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const {colors} = useTheme();

  const [routineId, setRoutineId] = useState('');
  const [routineNameInput, setRoutineNameInput] = useState('');
  const [routineDescriptionInput, setRoutineDescriptionInput] = useState('');
  const [selectedColorPosition, setSelectedColorPosition] = useState(0);
  const [privateRoutineSwitch, setPrivateRoutineSwitch] = useState(false);

  const [editRoutine, setEditRoutine] = useState(false);

  const createTaskrefBottomModalTEST = useRef();

  const [routinesTASKSTEST, setroutinesTASKSTEST] = useState([]);

  const [newTaskCreated, setNewTaskCreated] = useState(false);

  console.log('ROUTINE__:', routine);

  useEffect(() => {
    console.log('ALGO EN USEEFECT::::::___');
    navigation.setOptions({
      title: `${routineName}`,
    });
    setroutinesTASKSTEST(routineTasks);
  }, [navigation, routineName, routineTasks, newTaskCreated]);

  const currentDate = new Date();

  const handleCreateAndSeveNewTask = async (
    t,
    c,
    aOrn,
    hr,
    mn,
    i,
    pom,
    filt,
    subtArr,
  ) => {
    try {
      realm.write(() => {
        const routineToAddTask = realm.objectForPrimaryKey(
          'Routine',
          ObjectId(routine._id),
        );
        routineToAddTask.tasks.push({
          alarmNotifIds: [],
          color: c,
          done: false,
          filter: filt,
          icon: i,
          id: uuidv4(),
          mode: aOrn,
          name: t,
          pomodoro: pom,
          soundYear: 0,
          soundMonth: 0,
          soundDay: 0,
          soundHour: hr,
          soundMinute: mn,
          subtasks: subtArr.length > 0 ? subtArr : [],
          userID: realmApp.currentUser
            ? realmApp.currentUser.id
            : 'unknownUser',
        });
      });
      setNewTaskCreated(!newTaskCreated);
    } catch (error) {
      console.log('ERR TO ADD TASK IN ROUTINE', error);
    }

    // setUserTasks(
    //   realm
    //     .objects('Task')
    //     .filtered(
    //       `soundDay == ${props.day} AND soundMonth == ${props.month} AND soundYear == ${props.year}`,
    //     ),
    // );

    // const pendingAlarmsData = realm.objects('Task').filtered('alarm == true');

    // const pendingAlarmsDataIds = pendingAlarmsData.map((itemId) => itemId.id);

    // if (pendingAlarmsDataIds.length > 0) {
    //   storeSettingsData('pendingAlarms', JSON.stringify(pendingAlarmsDataIds));
    // } else {
    //   removeSettingsData('pendingAlarms');
    // }

    // setPendingAlarmsArr(pendingAlarmsDataIds);
    createTaskrefBottomModalTEST.current.close();
  };

  const createTaskModal = () => {
    return (
      <BottomModal
        openModal={createTaskrefBottomModalTEST}
        wrapperColor={colors.subModalWrapper}
        muchContent={true}
        borderRadiusTop={40}
        keyBoardPushContent={false}
        closeDragDown={true}
        customPaddingHorizontal={true}
        closeDragTopOnly={true}
        content={
          <CreateEditTask
            modalTitle={I18n.t('new')}
            buttonSubmitText={I18n.t('create')}
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
            ) => {
              console.log('el SUBTASK in routine', subtasksArr)
              handleCreateAndSeveNewTask(
                txt,
                color,
                aOrn,
                h,
                m,
                icn,
                pom,
                filt,
                subtasksArr,
              );
              console.log('m', m);
              console.log('icno', icn);
              console.log('syb', subtasksArr);
            }}
            editModal={false}
            passCloseModal={value => {
              value ? createTaskrefBottomModalTEST.current.close() : null;
            }}
          />
        }
      />
    );
  };

  const handleAddMyRoutines = (name, des, color, publicRoutine, tasks, creator) => {
    const data = {
      _id: ObjectId(),
      name: name,
      description: des,
      colorPosition: color,
      private: publicRoutine,
      tasks: tasks,
      userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
      creator: {
        id: creator.id,
        name: creator.name,
        img: creator.img,
      },
    };

    try {
      realm.write(() => {
        realm.create('Routine', data);
      });
      console.log('ROUTINE ADDED SUCCESFULL');
    } catch (error) {
      console.log('ERR IN ADD MY ROUTINES', error);
    }
  };

  return (
    <View>
      <View
        style={{
          padding: 8,
        }}>
        <LinearGradient
          colors={[
            routinesColors[color_position].color1,
            routinesColors[color_position].color2,
          ]}
          style={{borderRadius: 30, width: '100%'}}>
          <Button
            customDisable={true}
            onPress={() => Alert.alert('pressed')}
            styleBtn={{
              width: '100%',
              height: otherUserRoutine ? 225 : 220,
              //   borderRadius: 25,
              //   backgroundColor: 'blue',
              padding: 25,
            }}
            content={
              <View
                style={{
                  // backgroundColor: 'purple',
                  height: '100%',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    // backgroundColor: 'orange',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      // backgroundColor: 'red',
                      width: '100%',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        // backgroundColor: 'orange',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                        }}>
                        {routine.private ? (
                          <SimpleLineIcons
                            name="lock"
                            color="white"
                            size={20}
                            style={{
                              marginRight: 3,
                            }}
                          />
                        ) : null}
                        <Text
                          style={{
                            fontSize: 18,
                            color: 'white',
                            // fontFamily: Typography.RoutineName,
                          }}>
                          {routine.name}
                        </Text>
                      </View>
                      {/* <Text style={styles.routineNameTextStyle}>
                        {routineName}
                      </Text> */}
                      {otherUserRoutine &&
                      realmApp?.currentUser.id !== routine.creator.id ? (
                        <Button
                          onPress={() =>
                            handleAddMyRoutines(
                              routine.name,
                              routine.description,
                              routine.colorPosition,
                              routine.private,
                              routine.tasks,
                              routine.creator
                            )
                          }
                          content={
                            <View>
                              <Text>Add 'My Routines'</Text>
                            </View>
                          }
                          styleBtn={{
                            backgroundColor: 'white',
                            paddingHorizontal: 15,
                            paddingVertical: 8,
                            borderRadius: 100,
                          }}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineDescription,
                        color: 'white',
                        fontSize: 14,
                      }}>
                      {routineDescription}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    // backgroundColor: 'brown',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      Start
                    </Text>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      {routine.tasks?.length > 0
                        ? handleReadableDate(
                            routine.tasks
                              .filter(item => item)
                              .sort(
                                (a, b) =>
                                  a.soundHour - b.soundHour ||
                                  a.soundMinute - b.soundMinute,
                              )[0].soundHour,
                            routine.tasks
                              .filter(item => item)
                              .sort(
                                (a, b) =>
                                  a.soundHour - b.soundHour ||
                                  a.soundMinute - b.soundMinute,
                              )[0].soundMinute,
                          )
                        : '00:00'}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      {routine.tasks?.length ? routine.tasks?.length : 0}
                    </Text>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      Tasks
                    </Text>
                  </View>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      Finish
                    </Text>
                    <Text
                      style={{
                        // fontFamily: Typography.RoutineProperties,
                        color: 'white',
                        fontSize: 15,
                      }}>
                      {routine.tasks?.length > 0
                        ? handleReadableDate(
                            routine.tasks
                              .filter(item => item)
                              .sort(
                                (a, b) =>
                                  a.soundHour - b.soundHour ||
                                  a.soundMinute - b.soundMinute,
                              )[routine.tasks.length - 1].soundHour,
                            routine.tasks
                              .filter(item => item)
                              .sort(
                                (a, b) =>
                                  a.soundHour - b.soundHour ||
                                  a.soundMinute - b.soundMinute,
                              )[routine.tasks.length - 1].soundMinute,
                          )
                        : '00:00'}
                    </Text>
                  </View>
                  {routine.userID !== routine.creator.id ? (
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        In Use
                      </Text>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        1,233
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            }
          />
          {otherUserRoutine && routine.userID === routine.creator.id ? (
            <Button
              onPress={() =>
                navigation.navigate('UserRoutinesProfile', {
                  // routineName: item.location.street.name,
                  // routineDescription: item.location.timezone.description,
                  // color: Number(String(item.dob.age).charAt(0)),
                  // idRoutine: 'iuhy76y76f76',
                  // otherUserRoutine: true,
                  userImgProfile: userCreatorImgProfile,
                  userName: userCreatorUserName,
                  userFirstName: userCreatorFirstName,
                  userLastName: userCreatorLastName,
                  userStudy: imStudy,
                  // name:
                })
              }
              content={
                <View
                  style={{
                    // backgroundColor: 'orange',
                    flexDirection: 'column',
                    paddingHorizontal: 30,
                    marginTop: -4,
                  }}>
                  <Text
                    style={{
                      // fontFamily: Typography.RoutineProperties,
                      fontSize: 15,
                      marginBottom: 8,
                      color: 'white',
                    }}>
                    Created by:
                  </Text>
                  <View
                    style={{
                      // backgroundColor: 'brown',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          width: 45,
                          height: 45,
                          backgroundColor: userCreatorImgProfile,
                          borderRadius: 100,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}>
                        <Text>
                          {userCreatorUserName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineDescription,
                          fontSize: 15,
                          paddingVertical: 2,
                          color: 'white',
                        }}>
                        {userCreatorUserName}
                      </Text>
                    </View>
                    <Text style={{color: '#006BFF'}}>View Profile</Text>
                  </View>
                </View>
              }
              styleBtn={{
                // backgroundColor: 'yellow',
                marginBottom: 20,
              }}
            />
          ) : null}
        </LinearGradient>
      </View>
      {routine.tasks?.length > 0 ? (
        <View>
          {!otherUserRoutine ? (
            <View
              style={{
                backgroundColor: 'orange',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 25,
                paddingVertical: 10,
              }}>
              <Text
                style={{
                  // fontFamily: Typography.RoutineProperties,
                  fontSize: 20,
                }}>
                Tasks
              </Text>
              <AddButton
                onPress={() => {
                  // setEditRoutine(false);
                  // setRoutineNameInput('');
                  // setRoutineDescriptionInput('');
                  // setPrivateRoutineSwitch(false);
                  // setSelectedColorPosition(0);
                  createTaskrefBottomModalTEST.current.open();
                }}
                iconSize={35}
              />
            </View>
          ) : null}
          <FlatListTasks
            routine_id={routine._id}
            tasksInRoutines={true}
            other_user_routine={otherUserRoutine}
            flatlistData={routineTasks
              .map(item => item)
              .sort(
                (a, b) =>
                  a.soundHour - b.soundHour || a.soundMinute - b.soundMinute,
              )}
            flatlistDataChange={value =>
              value ? setNewTaskCreated(!newTaskCreated) : null
            }
            yearReceived={0}
            monthReceived={0}
            dayReceived={0}
            // flatlistDataChange={() =>
            //   setChangeDataFlatlistTasks(!changeDataFlatlistTasks)
            // }
          />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: 'green',
            padding: 11,
            height: '50%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {realmApp?.currentUser.id === routine.creator.id ? (
            <View>
              <Text>Add Tasks</Text>
              <AddButton
                onPress={() => {
                  setEditRoutine(false);
                  setRoutineNameInput('');
                  setRoutineDescriptionInput('');
                  setPrivateRoutineSwitch(false);
                  setSelectedColorPosition(0);
                  createTaskrefBottomModalTEST.current.open();
                }}
                iconSize={64}
              />
            </View>
          ) : (
            <Text>no tasks</Text>
          )}
        </View>
      )}
      {createTaskModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  routineNameTextStyle: {
    // fontFamily: Typography.RoutineName,
    fontSize: 20,
    color: 'white',
  },
});

export default RoutineId;
{
  /* <>
      <ScrollView>
        <View
          style={{
            // backgroundColor: 'red',
            padding: 8,
            height: '100%',
            alignItems: 'center',
          }}>
          {otherUserRoutine ? (
            <Button
              onPress={() =>
                navigation.navigate('UserRoutinesProfile', {
                  // routineName: item.location.street.name,
                  // routineDescription: item.location.timezone.description,
                  // color: Number(String(item.dob.age).charAt(0)),
                  // idRoutine: 'iuhy76y76f76',
                  // otherUserRoutine: true,
                  userImgProfile: userCreatorImgProfile,
                  userName: userCreatorUserName,
                  userFirstName: userCreatorFirstName,
                  userLastName: userCreatorLastName,
                  userStudy: imStudy,
                  // name:
                })
              }
              content={
                <View
                  style={{
                    // backgroundColor: 'brown',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{uri: userCreatorImgProfile}}
                    style={{
                      width: 50,
                      height: 50,
                      // resizeMode: 'cover',
                      // position: 'absolute',
                      // top: '0%',
                      borderRadius: 100,
                    }}
                  />
                  <Text>PROFILE</Text>
                </View>
              }
              styleBtn={{
                // backgroundColor: 'yellow',
                width: '90%',
                marginBottom: 10,
              }}
            />
          ) : null}
          <LinearGradient
            colors={[
              courseColors[color_position].color1,
              courseColors[color_position].color2,
            ]}
            style={{borderRadius: 30, width: '100%'}}>
            <Button
              customDisable={true}
              onPress={() => Alert.alert('pressed')}
              styleBtn={{
                width: '100%',
                height: 220,
                //   borderRadius: 25,
                //   backgroundColor: 'blue',
                padding: 25,
              }}
              content={
                <View
                  style={{
                    // backgroundColor: 'purple',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      // backgroundColor: 'orange',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        // backgroundColor: 'red',
                        width: '100%',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.routineNameTextStyle}>
                        {routineName}
                      </Text>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineDescription,
                          color: 'white',
                          fontSize: 14,
                        }}>
                        {routineDescription}
                      </Text>
                    </View>
                    {otherUserRoutine ? (
                      <Button
                        content={
                          <View>
                            <Text>Add 'My Routines'</Text>
                          </View>
                        }
                        styleBtn={{
                          // backgroundColor: 'blue',
                          paddingHorizontal: 15,
                          paddingVertical: 8,
                          borderRadius: 100,
                        }}
                      />
                    ) : null}
                  </View>

                  <View
                    style={{
                      // backgroundColor: 'brown',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        Start
                      </Text>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        00:00
                      </Text>
                    </View>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        0
                      </Text>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        Tasks
                      </Text>
                    </View>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        Finish
                      </Text>
                      <Text
                        style={{
                          // fontFamily: Typography.RoutineProperties,
                          color: 'white',
                          fontSize: 15,
                        }}>
                        00:00
                      </Text>
                    </View>
                    {otherUserRoutine ? (
                      <View
                        style={{flexDirection: 'column', alignItems: 'center'}}>
                        <Text>In Use</Text>
                        <Text>1,233</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              }
            />
          </LinearGradient>
          <View style={{flex: 1}}>
            {routineTasks.length > 0 ? (
              <FlatListTasks
                flatlistData={routineTasks
                  .map((item) => item)
                  .sort(
                    (a, b) =>
                      a.soundHour - b.soundHour ||
                      a.soundMinute - b.soundMinute,
                  )}
                yearReceived={currentDate.getFullYear()}
                monthReceived={currentDate.getMonth()}
                dayReceived={currentDate.getDate()}
                // flatlistDataChange={() =>
                //   setChangeDataFlatlistTasks(!changeDataFlatlistTasks)
                // }
              />
            ) : (
              <View
                style={{
                  // backgroundColor: 'green',
                  padding: 11,
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text>Add Tasks</Text>
                <AddButton
                  onPress={() => {
                    setEditRoutine(false);
                    setRoutineNameInput('');
                    setRoutineDescriptionInput('');
                    setPrivateRoutineSwitch(false);
                    setSelectedColorPosition(0);
                    createTaskrefBottomModalTEST.current.open();
                  }}
                  iconSize={64}
                />
              </View>
            )}
          </View>
          {createTaskModal()}
        </View>
      </ScrollView>
    </> */
}
