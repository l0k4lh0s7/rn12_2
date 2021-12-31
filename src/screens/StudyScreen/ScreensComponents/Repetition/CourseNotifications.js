/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState, useContext} from 'react';
import {View, Text, TextInput, FlatList, Alert, Switch} from 'react-native';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {ObjectId} from 'bson';

import {getRealm} from '../../../../services/realm';

import AddButton from '../../../../components/AddButton';
import BottomModal from '../../../../components/BottomModal';
import SubmitButtons from '../../../../components/BottomModal/submitButtons';
import TextModal from '../../../../components/BottomModal/textModal';
import Button from '../../../../components/Button';
import SwitchSelector from '../../../../components/SwitchSelector';
import DateTimePickerModal from '../../../../components/DateTimePicker';
// import Modal from '../../../../components/Modal';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '@react-navigation/native';

import {
  courseColors,
  notificationsRepetition,
  responsive,
  showAlert,
  handleReadableDate,
  scheduleCourseNotification,
  updateCourseNotification,
  unscheduleCourseNotification,
  isEmpty,
} from '../../../../utils';

import RealmContext from '../../../../contexts/RealmContext';

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
  handleScheduleLocalNotification,
  showNotification,
} from '../../../../notification';

import ReactNativeAN from 'react-native-alarm-notification';

const size = responsive();

const CourseNotifications = ({route, navigation}) => {
  const {colors} = useTheme();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [courseNotificationsArr, setCourseNotificationsArr] = useState([]);
  const [shouldGenerateRandomTime, setShouldGenerateRandomTime] = useState(false);

  const {courseTitle, color, courseId} = route.params;
  
  //helper para hacer funcional el arrtimestructure, manejandolo con las posiciones de un arr 0, 1, 2, .....
  const [currentDateTimePickerPosition, setCurrentDateTimePickerPosition] = useState(0);

  const [deletedNotification, setDeletedNotification] = useState(false);

  const [editNotification, setEditNotification] = useState(false);

  const [notificationActive, setNotificationActive] = useState(true);
  
  const [notificationId, setNotificationId] = useState('');
  const [notificationStudyTitle, setNotificationStudyTitle] = useState('');
  const [notificationStudyBody, setNotificationStudyBody] = useState('');
  const [notificationRepetitionCount, setNotificationRepetitionCount] = useState(1);
  const [randomTimeRange, setRandomTimeRange] = useState({start: null, end: null});
  const [notificationFireTimes, setNotificationFireTimes] = useState([]);

  const [notificationRepetitionsTimeArr, setNotificationRepetitionsTimeArr] = useState([]);

  const [
    Helper_in_Edit_notificationRepetitionsTimeArr,
    setHelper_in_Edit_NotificationRepetitionsTimeArr,
  ] = useState([]);

  const [courseNotifications, setCourseNotifications] = useState(false);

  const createOrEditNotificationrefBottomModal = useRef();
  // const createOrEditNotificationrefBottomModal = useRef();
  const deleteOrEditNotificationBottomModal = useRef();


  useEffect(() => {
    console.log('id course', courseId);
    navigation.setOptions({
      title: `${courseTitle}`,
    });

    realm.write(() => {
      const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
      setCourseNotificationsArr(coursefound.notificationsStudy)
    });
  }, [navigation, courseTitle, courseNotifications, realm]);

  const notificationTimeStructure = (index, dateTime) => {
      const temp = [...notificationFireTimes];
      temp[index] = {
        fireHour: dateTime.getHours(),
        fireMinute: dateTime.getMinutes(),
        notificationId: editNotification ? notificationFireTimes[index] 
                            ? notificationFireTimes[index].notificationId 
                            : null : null
      }
      setNotificationFireTimes(temp);
  }

  const createNotificationTimeObjects = _ => {
    if (!editNotification && shouldGenerateRandomTime){
      const notifications = [];
      for (let i = 0; i < notificationRepetitionCount; i++){
        notifications.push({
          fireHour: 0,
          fireMinute: 0,
          notificationId: null
        });
      }
      return notifications;
    } else {
      return notificationFireTimes;
    }
  }

  const handleCreateAndSeveNewNotification = async function (
    notificationTitle,
    body,
    switchValue,
    repetitionCount,
  ) {
    const notificationObject = {
      id: uuidv4(),
      title: notificationTitle.trim(),
      body: body.trim(),
      isActive: switchValue,
      repetitionCount: repetitionCount,
      isRandomTime: shouldGenerateRandomTime,
      randomTimeRange: randomTimeRange,
      notifications: createNotificationTimeObjects()
    }

    if (notificationObject.notifications.length < notificationRepetitionCount){
      Alert.alert("Select time");
      return;
    }

    scheduleCourseNotification(
      courseId,
      notificationObject,
      _ => {
        try {
          realm.write(() => {
            const course = realm.objectForPrimaryKey(
              'Course',
              ObjectId(courseId),
            );
            course.notificationsStudy.push(notificationObject);
            setCourseNotificationsArr(course.notificationsStudy);
          });

          setNotificationId(null);
          setNotificationStudyTitle('');
          setNotificationStudyBody('');
          setNotificationRepetitionCount(1);
          setShouldGenerateRandomTime(false);
          setRandomTimeRange({start: null, end: null});
          setNotificationFireTimes([]);
          createOrEditNotificationrefBottomModal.current.close();
        } catch (error) {
          console.log('ERR', error);
        }
      },
      _ => {
        realm.write(() => {
          const course = realm.objectForPrimaryKey('Course', ObjectId(courseId));
          setCourseNotificationsArr(course.notificationsStudy)
        });
      }
    );
  };

  const handleUpdateAndSaveNotification = async function (
    notificationTitle,
    body,
    switchValue,
    repetitionCount,
  ) {
    const foundNotification = courseNotificationsArr.find(item => item.id === notificationId);

    // Create a copy to avoid realm errors
    const courseNotificationCopy = JSON.parse(JSON.stringify(foundNotification));
    courseNotificationCopy.title = notificationTitle.trim();
    courseNotificationCopy.body = body.trim();
    courseNotificationCopy.isActive = switchValue;
    courseNotificationCopy.repetitionCount = repetitionCount;
    courseNotificationCopy.isRandomTime = shouldGenerateRandomTime;
    courseNotificationCopy.randomTimeRange = randomTimeRange;
    courseNotificationCopy.notifications = createNotificationTimeObjects();

    if (courseNotificationCopy.notifications.length < notificationRepetitionCount){
      Alert.alert("Select time");
      return;
    }

    unscheduleCourseNotification(courseNotificationCopy, _ => {
      scheduleCourseNotification(
        courseId,
        courseNotificationCopy,
        _ => {
          try {
            realm.write(() => {
              foundNotification.title = courseNotificationCopy.title;
              foundNotification.body = courseNotificationCopy.body;
              foundNotification.isActive = courseNotificationCopy.isActive;
              foundNotification.repetitionCount = courseNotificationCopy.repetitionCount;
              foundNotification.isRandomTime = courseNotificationCopy.isRandomTime;
              foundNotification.randomTimeRange = courseNotificationCopy.randomTimeRange;
              foundNotification.notifications = courseNotificationCopy.notifications;
            });
            realm.write(() => {
              const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
              setCourseNotificationsArr(coursefound.notificationsStudy)
            });
            setNotificationId(null);
            setNotificationStudyTitle('');
            setNotificationStudyBody('');
            setNotificationRepetitionCount(1);
            setShouldGenerateRandomTime(false);
            setRandomTimeRange({start: null, end: null});
            setNotificationFireTimes([]);
            createOrEditNotificationrefBottomModal.current.close();
          } catch (error) {
            console.log('ERR', error);
          }
        },
        _ => {
          realm.write(() => {
            const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
            setCourseNotificationsArr(coursefound.notificationsStudy)
          });
        }
      );
    });
  }

  const handleDeleteNotification = async (notifId) => {
    setDeletedNotification(true);
    const courseNotification = courseNotificationsArr.find(item => item.id === notifId);

    unscheduleCourseNotification(courseNotification, _ => {
      try {
        realm.write(() => {
          const course = realm.objectForPrimaryKey('Course', ObjectId(courseId));
          // Create a copy to avoid realm errors
          const notifications = JSON.parse(JSON.stringify(course.notificationsStudy));
          course.notificationsStudy = notifications.filter(item => item.id !== notifId);
          setCourseNotificationsArr(course.notificationsStudy);
        });
      } catch (error) {
        console.log('ERR', error);
      }
      setNotificationId(null);
      setNotificationStudyTitle('');
      setNotificationStudyBody('');
      setNotificationRepetitionCount(1);
      setShouldGenerateRandomTime(false);
      setRandomTimeRange({start: null, end: null});
      setNotificationFireTimes([]);
      deleteOrEditNotificationBottomModal.current.close();
    })
  };

  const handleOnOffNotification = async (notifId, isActive) => {
    const courseNotification = courseNotificationsArr.find(item => item.id === notifId);

    if (!courseNotification){
      console.error('ERROR', 'Notification not found. notifId:', notifId)
      return;
    }

    if (isActive === true){
      // Create a copy to avoid realm errors
      const courseNotificationCopy = JSON.parse(JSON.stringify(courseNotification));
      courseNotificationCopy.isActive = isActive;

      scheduleCourseNotification(
        courseId,
        courseNotificationCopy,
        _ => {
          try {
            realm.write(() => {
              courseNotification.isActive = isActive;
            });
          } catch (error) {
            console.log('ERR', error);
          }
          realm.write(() => {
            const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
            setCourseNotificationsArr(coursefound.notificationsStudy)
          });
        },
        _ => {
          realm.write(() => {
            const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
            setCourseNotificationsArr(coursefound.notificationsStudy)
          });
        }
      );

    } else {
      unscheduleCourseNotification(courseNotification, _ => {
        try {
          realm.write(() => {
            courseNotification.isActive = isActive;
            for (let i = 0, len = courseNotification.notifications.length; i < len; i++){
              courseNotification.notifications[i].notificationId = null;
            }
          });
        } catch (error) {
          console.log('ERR', error);
        }
        realm.write(() => {
          const coursefound = realm.objectForPrimaryKey('Course', ObjectId(courseId));
          setCourseNotificationsArr(coursefound.notificationsStudy)
        });
      });
    }
  };

  const notificationsTimeUIStructure = () => {
    let paddingHorizontalContainer;

    let inputHeight;
    let placeHolderFontSize;

    let paddingVerticalButtton;
    let paddingHorizontalButtton;
    let fontSizeButton;

    let switchSelectorFontSize;

    if (size === 'small') {
      paddingHorizontalContainer = 45;

      inputHeight = 25;
      placeHolderFontSize = 10;

      paddingVerticalButtton = 7;
      paddingHorizontalButtton = 18;
      fontSizeButton = 9;

      switchSelectorFontSize = 9;
    } else if (size === 'medium') {
      paddingHorizontalContainer = 40;

      inputHeight = 30;
      placeHolderFontSize = 12;

      paddingVerticalButtton = 8;
      paddingHorizontalButtton = 18;
      fontSizeButton = 13;

      switchSelectorFontSize = 10;
    } else {
      paddingHorizontalContainer = 35;
      inputHeight = 35;
      placeHolderFontSize = 14;

      paddingVerticalButtton = 10;
      paddingHorizontalButtton = 18;
      fontSizeButton = 14;

      switchSelectorFontSize = 12;
    }

    const dummyArray = Array.from({length: notificationRepetitionCount}, (_, i) => i);

    return (
      <View
        style={{
          // backgroundColor: 'green',
          flexDirection: 'row',
          justifyContent: notificationRepetitionCount >= 3 ? 'space-between' : 'space-around',
          width: '100%',
        }}>
          { 
            dummyArray.map(
              index => (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: `${90 / notificationRepetitionCount}%`,
                  }}>
                    <Text style={{marginEnd: 4, color: colors.text}}>{index + 1}:</Text>
                    <View
                      style={{
                        width: '95%',
                      }}>
                      <DateTimePickerModal
                        pressed={ _ => {} }
                        passAll={true}
                        passHourAndMinutes={time => notificationTimeStructure(index, time)}
                        isEditModal={editNotification}
                        hour={
                          editNotification
                            ? notificationFireTimes[index] ? notificationFireTimes[index].fireHour
                            : null
                            : null
                        }
                        minute={
                          editNotification
                            ? notificationFireTimes[index] ? notificationFireTimes[index].fireMinute
                            : null
                            : null
                        }
                        buttonStyle={{
                          paddingVertical: paddingVerticalButtton,
                          paddingHorizontal: paddingHorizontalButtton,
                          backgroundColor: colors.forms,
                          borderRadius: 8,
                          width: '100%',
                        }}
                        fontSizeButton={fontSizeButton}
                      />
                    </View>
                </View>
              )
            )
          }
        </View>
    );
  };

  const createNotificationModal = () => {
    return (
      <BottomModal
        openModal={createOrEditNotificationrefBottomModal}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={670}
        borderRadiusTop={40}
        closeDragDown={true}
        customPaddingHorizontal={true}
        content={
          <View
            style={{
              // paddingHorizontal: 20,
              backgroundColor: null,
              height: '94%',
              justifyContent: 'space-between',
            }}>
            <View>
              <TextModal
                text={ editNotification ? "Edit repeating notification" : "Create new repeating notification"}
                textTitle={true}
              />
              <LinearGradient
                start={{x: 0.0, y: 0.25}}
                end={{x: 0.5, y: 1.0}}
                colors={[
                  courseColors[color].color1,
                  courseColors[color].color2,
                ]}
                style={{
                  marginVertical: 10,
                  backgroundColor: null,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 14,
                }}>
                <Text style={{color: 'white', fontSize: 13}}>
                  {courseTitle}
                </Text>
              </LinearGradient>
              <TextModal text="Title or Question" textTitle={false} />
              <TextInput
                value={notificationStudyTitle}
                onChangeText={value => setNotificationStudyTitle(value)}
                placeholder="Ej. ¿Cuando fue x Acontecimiento?, significado de x palabra, estudia lo que quieras"
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingVertical: 20,
                  borderRadius: 15,
                  marginBottom: 5,
                }}
              />
              <TextModal
                text="Answer, information or meaning"
                textTitle={false}
              />
              <TextInput
                value={notificationStudyBody}
                onChangeText={value => setNotificationStudyBody(value)}
                placeholder="Ej. Respuesta o significado de tu titlulo"
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingTop: 20,
                  paddingBottom: 50,
                  borderRadius: 20,
                  marginBottom: 5,
                }}
              />
              <TextModal text="Repetitions in the day" textTitle={false} />
              <Text
                style={{fontSize: 10, textAlign: 'center', color: '#8D8D8D'}}>
                number of notifications that will reach you in one day
              </Text>
              <SwitchSelector
                passOptions={notificationsRepetition}
                isEditModal={editNotification}
                currentValue={notificationRepetitionCount - 1}
                passValueSelected={value => {
                  const temp = [...notificationFireTimes];
                  while (value < temp.length){
                    temp.pop();
                  }
                  setNotificationFireTimes(temp);
                  setNotificationRepetitionCount(value)
                }}
                passFontSize={12}
                passHeight={40}
                backgroundColor={colors.forms}
                textColor={colors.text}
                passCustomBtnColor={colors.primary}
                passSelectedTxtColor={colors.forms}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  // width: '63%',
                  justifyContent: 'space-between',
                  marginTop: 17,
                }}>
                <Text>Random Notification Time</Text>
                <Switch
                  value={shouldGenerateRandomTime}
                  onValueChange={ value => setShouldGenerateRandomTime(value) }
                />
              </View>
              <TextModal
                text={shouldGenerateRandomTime ? 'Random Time Range' : 'Notifictions time'}
                textTitle={false}
              />

              {shouldGenerateRandomTime ? (
                <>
                  <Text
                    style={{
                      fontSize: 10,
                      textAlign: 'center',
                      color: '#8D8D8D',
                    }}>
                    select the time range to receive notifications in random
                    time
                  </Text>
                  <View
                    style={{
                      // backgroundColor: 'red',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <View
                      style={{
                        // backgroundColor: 'green',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      }}>
                      <Ionicons
                        name="md-sunny"
                        color={colors.text}
                        size={18}
                        style={{
                          marginRight: 2,
                        }}
                      />
                      <DateTimePickerModal
                        pressed={value => {}}
                        passAll={true}
                        passHourAndMinutes={ time => setRandomTimeRange({...randomTimeRange, start: time}) }
                        isEditModal={editNotification}
                        hour={
                          editNotification ? randomTimeRange['start'] ? randomTimeRange['start'].getHours() : null : null
                        }
                        minute={
                          editNotification ? randomTimeRange['start'] ? randomTimeRange['start'].getMinutes() : null : null
                        }
                        buttonStyle={{
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          backgroundColor: colors.forms,
                          borderRadius: 8,
                        }}
                        fontSizeButton={12}
                      />
                    </View>
                    <View
                      style={{
                        // backgroundColor: 'green',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      }}>
                      <Entypo
                        name="moon"
                        color={colors.text}
                        size={18}
                        style={{
                          marginRight: 2,
                        }}
                      />
                      <DateTimePickerModal
                        pressed={value => {}}
                        passAll={true}
                        passHourAndMinutes={ time => setRandomTimeRange({...randomTimeRange, end: time}) }
                        isEditModal={editNotification}
                        hour={
                          editNotification ? randomTimeRange['end'] ? randomTimeRange['end'].getHours() : null : null
                        }
                        minute={
                          editNotification ? randomTimeRange['end'] ? randomTimeRange['end'].getMinutes() : null : null
                        }
                        buttonStyle={{
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          backgroundColor: colors.forms,
                          borderRadius: 8,
                        }}
                        fontSizeButton={12}
                      />
                    </View>
                  </View>
                </>
              ) : (
                notificationsTimeUIStructure()
              )}
            </View>
            <SubmitButtons
              leftButtonFunction={() => {
                setNotificationId(null);
                setNotificationStudyTitle('');
                setNotificationStudyBody('');
                setNotificationRepetitionCount(1);
                setShouldGenerateRandomTime(false);
                setRandomTimeRange({start: null, end: null});
                setNotificationFireTimes([]);
                createOrEditNotificationrefBottomModal.current.close()
              }}
              leftButtonText="Cancel"
              rightButtonFunction={() => {
                (isEmpty(notificationStudyTitle) || isEmpty(notificationStudyBody))
                  ? Alert.alert('Rellena los campos')
                  : editNotification ? handleUpdateAndSaveNotification(
                      notificationStudyTitle,
                      notificationStudyBody,
                      notificationActive,
                      notificationRepetitionCount,
                  )
                  : handleCreateAndSeveNewNotification(
                      notificationStudyTitle,
                      notificationStudyBody,
                      notificationActive,
                      notificationRepetitionCount,
                    )
              }}
              rightButtonText={editNotification ? "Update" : "Create"}
            />
            {/* <View
              style={{
                backgroundColor: null,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <Button
                onPress={() => createOrEditNotificationrefBottomModal.current.close()}
                content={
                  <View
                    style={{
                      borderColor: '#3F3F3F',
                      borderWidth: 1,
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: '#3F3F3F'}}>Cancelar</Text>
                  </View>
                }
              />
              <Button
                onPress={() =>
                  notificationStudyTitle.length === 0 &&
                  notificationStudyBody.length === 0
                    ? Alert.alert('Rellena los campos')
                    : handleCreateAndSeveNewNotification(
                        notificationStudyTitle,
                        notificationStudyBody,
                        notificationActive,
                        notificationRepetitionCount,
                      )
                }
                content={
                  <View
                    style={{
                      backgroundColor: '#0B6DF6',
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: 'white'}}>Crear</Text>
                  </View>
                }
              />
            </View> */}
          </View>
        }
      />
    );
  };

  const editNotificationModal = () => {
    return (
      <BottomModal
        openModal={createOrEditNotificationrefBottomModal}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={660}
        borderRadiusTop={40}
        closeDragDown={true}
        content={
          <View
            style={{
              paddingHorizontal: 20,
              backgroundColor: null,
              height: '94%',
              justifyContent: 'space-between',
            }}>
            <View>
              <TextModal text="Edit repeating notification" textTitle={true} />
              <LinearGradient
                start={{x: 0.0, y: 0.25}}
                end={{x: 0.5, y: 1.0}}
                colors={[
                  courseColors[color].color1,
                  courseColors[color].color2,
                ]}
                style={{
                  marginVertical: 10,
                  backgroundColor: null,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 14,
                }}>
                <Text style={{color: 'white', fontSize: 13}}>
                  {courseTitle}
                </Text>
              </LinearGradient>
              <TextModal text="Title or Question" textTitle={false} />
              <TextInput
                //   autoFocus
                value={notificationStudyTitle}
                onChangeText={value => setNotificationStudyTitle(value)}
                placeholder="Ej. ¿Cuando fue x Acontecimiento?, significado de x palabra, estudia lo que quieras"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createOrEditNotificationrefBottomModal.current.close()
                //   }
                //   onEndEditing={() =>
                //     createOrEditNotificationrefBottomModal.current.close()
                //   }
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingVertical: 20,
                  borderRadius: 15,
                  marginBottom: 5,
                }}
              />
              <TextModal
                text="Answer, information or meaning"
                textTitle={false}
              />
              <TextInput
                //   autoFocus
                value={notificationStudyBody}
                onChangeText={value => setNotificationStudyBody(value)}
                placeholder="Ej. Respuesta o significado de tu titlulo"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createOrEditNotificationrefBottomModal.current.close()
                //   }
                // onEndEditing={() => addCourserefBottomModal.current.close()}
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingTop: 20,
                  paddingBottom: 50,
                  borderRadius: 20,
                  marginBottom: 5,
                }}
              />
              {editNotification ? null : (
                <>
                  <TextModal text="Repetitions in the day" textTitle={false} />
                  <Text
                    style={{
                      fontSize: 10,
                      textAlign: 'center',
                      color: '#8D8D8D',
                    }}>
                    number of notifications that will reach you in one day
                  </Text>
                  <SwitchSelector
                    passOptions={notificationsRepetition}
                    passValueSelected={value =>
                      setNotificationRepetitionCount(value)
                    }
                    passFontSize={12}
                    passHeight={40}
                    isEditModal={editNotification}
                    currentValue={notificationRepetitionCount - 1}
                    backgroundColor={colors.forms}
                    textColor={colors.text}
                    passCustomBtnColor={colors.primary}
                    passSelectedTxtColor={colors.forms}
                  />
                  <TextModal text="Notifictions time" textTitle={false} />
                  {notificationsTimeUIStructure()}
                </>
              )}
            </View>
            <View
              style={{
                backgroundColor: null,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <Button
                onPress={() => {
                  setNotificationId(null);
                  setNotificationStudyTitle('');
                  setNotificationStudyBody('');
                  setNotificationRepetitionCount(1);
                  setShouldGenerateRandomTime(false);
                  setRandomTimeRange({start: null, end: null});
                  setNotificationFireTimes([]);
                  createOrEditNotificationrefBottomModal.current.close()
                }}
                content={
                  <View
                    style={{
                      borderColor: '#3F3F3F',
                      borderWidth: 1,
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: '#3F3F3F'}}>Cancelar</Text>
                  </View>
                }
              />
              <Button
                onPress={() =>
                  notificationStudyTitle.length === 0 &&
                  notificationStudyBody.length === 0
                    ? Alert.alert('Nada que actualizar')
                    : handleUpdateAndSaveNotification(
                        notificationStudyTitle,
                        notificationStudyBody,
                        notificationActive,
                        notificationRepetitionCount,
                        notificationRepetitionsTimeArr,
                      )
                }
                content={
                  <View
                    style={{
                      backgroundColor: '#0B3FF6',
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: 'white'}}>Editar</Text>
                  </View>
                }
              />
            </View>
          </View>
        }
      />
    );
  };

  const deleteOrEditRoutineModal = () => {
    let paddingVerticalContainer;
    let paddingHorizontalPlusIconContainer;
    let icons;
    let fontSize;
    if (size === 'small') {
      paddingVerticalContainer = 15;
      paddingHorizontalPlusIconContainer = 20;
      icons = 35;
      fontSize = 10;
    } else if (size === 'medium') {
      paddingVerticalContainer = 22;
      paddingHorizontalPlusIconContainer = 28;
      icons = 45;
      fontSize = 12;
    } else {
      //large screen
      paddingVerticalContainer = 25;
      paddingHorizontalPlusIconContainer = 30;
      icons = 48;
      fontSize = 15;
    }
    return (
      <BottomModal
        openModal={deleteOrEditNotificationBottomModal}
        wrapperColor={colors.modalWrapper}
        muchContent={false}
        borderRadiusTop={40}
        closeDragDown={true}
        content={
          <View
            style={
              {
                // backgroundColor: 'yellow',
              }
            }>
            <Button
              onPress={() => {
                setEditNotification(false);
                showAlert(
                  'Eiminar Notificacion',
                  '¿Deseas Eliminar permanentemente la notificacion?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteNotification(notificationId);
                  },
                );
              }}
              content={
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'pink',
                  }}>
                  <FontAwesome
                    name="trash"
                    color={colors.text}
                    size={35}
                    style={{marginRight: 20}}
                  />
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Delete Notification
                  </Text>
                </View>
              }
              styleBtn={{
                paddingHorizontal: 25,
                paddingVertical: 15,
                // backgroundColor: 'orange',
              }}
            />
            <Button
              onPress={() => {
                setEditNotification(true);
                deleteOrEditNotificationBottomModal.current.close();
                setTimeout(_ => {
                  createOrEditNotificationrefBottomModal.current.open();
                }, 400)
              }}
              content={
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'pink',
                  }}>
                  <FontAwesome
                    name="edit"
                    color={colors.text}
                    size={35}
                    style={{marginRight: 15}}
                  />
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Edit Notification
                  </Text>
                  {/* {createNotificationModal()} */}
                </View>
              }
              styleBtn={{
                paddingHorizontal: 25,
                paddingVertical: 15,
                // backgroundColor: 'orange',
              }}
            />
            {/* {editNotificationModal()} */}
          </View>
        }
      />
    );
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        backgroundColor: null,
      }}>
      {courseNotificationsArr.length > 0 ? (
        <View style={{width: '100%', height: '100%'}}>
          <FlatList
            data={JSON.parse(JSON.stringify(courseNotificationsArr))} // To avoid realm errors
            keyExtractor={item => item.id}
            style={{backgroundColor: null, padding: 13}}
            numColumns={1}
            renderItem={({item}) => (
              <View
                style={{
                  backgroundColor: colors.forms,
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: '100%',
                  padding: 20,
                  marginVertical: 15,
                  borderRadius: 20,
                }}>
                <View
                  style={{
                    // backgroundColor: 'red',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <LinearGradient
                    start={{x: 0.0, y: 0.25}}
                    end={{x: 0.5, y: 1.0}}
                    colors={
                      item.isActive
                        ? [
                            courseColors[color].color1,
                            courseColors[color].color2,
                          ]
                        : [
                            colors.linearNotificationBoxDesactivate,
                            colors.linearNotificationBoxDesactivate,
                          ]
                    }
                    style={{
                      backgroundColor: null,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 50,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                    }}>
                    <Text
                      style={{
                        color: item.isActive
                          ? 'white'
                          : colors.textNotificationLinearBoxDesactivate,
                        fontSize: 13,
                      }}>
                      {courseTitle}
                    </Text>
                  </LinearGradient>
                  <Button
                    onPress={() => {
                      setNotificationId(item.id);
                      setNotificationStudyTitle(item.title);
                      setNotificationStudyBody(item.body);
                      setNotificationRepetitionCount(item.repetitionCount);
                      setShouldGenerateRandomTime(item.isRandomTime);
                      setRandomTimeRange(item.randomTimeRange);
                      setNotificationFireTimes(item.notifications);
                      deleteOrEditNotificationBottomModal.current.open();
                    }}
                    content={
                      <SimpleLineIcons
                        name="options"
                        color={colors.text}
                        size={25}
                      />
                    }
                  />
                </View>
                <View
                  style={{
                    // backgroundColor: 'orange',
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: item.isActive
                        ? colors.text
                        : colors.textNotificationDesactivate,
                      marginTop: 20,
                      marginBottom: 10,
                      fontSize: 18,
                    }}>
                    {item.title}
                  </Text>
                  <View
                    style={{
                      // backgroundColor: 'blue',
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      // width: '100%',
                    }}>
                    <View
                      style={{
                        // backgroundColor: 'pink',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: '15%',
                      }}>
                      <FontAwesome
                        name="repeat"
                        color={
                          item.isActive
                            ? colors.text
                            : colors.textNotificationDesactivate
                        }
                        size={22}
                      />
                      <Text
                        style={{
                          color: item.isActive
                            ? colors.text
                            : colors.textNotificationDesactivate,
                          fontSize: 15,
                          marginLeft: 2,
                        }}>
                        {item.repetitionCount}
                      </Text>
                    </View>
                    <View
                      style={{
                        // backgroundColor: 'yellow',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        width: '85%',
                      }}>
                      {item.notifications.map(item2 => (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <MaterialCommunityIcons
                            name="bell-ring"
                            color={
                              item.isActive
                                ? colors.text
                                : colors.textNotificationDesactivate
                            }
                            size={18}
                            style={{
                              marginRight: 2,
                            }}
                          />
                          <Text
                            style={{
                              color: item.isActive
                                ? colors.text
                                : colors.textNotificationDesactivate,
                            }}>
                            { handleReadableDate(item2.fireHour, item2.fireMinute) }
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Switch
                    value={item.isActive}
                    style={{marginTop: 10}}
                    onValueChange={
                      (switchValue) => {
                        handleOnOffNotification(item.id, switchValue)
                      }
                    }
                  />
                </View>
              </View>
            )}
          />
          <View
            style={{
              position: 'absolute',
              left: '80%',
              top: '90%',
              backgroundColor: 'green',
            }}>
            <AddButton
              onPress={() => {
                setDeletedNotification(false);
                setEditNotification(false);
                setNotificationId('');
                setNotificationStudyTitle('');
                setNotificationStudyBody('');
                setNotificationRepetitionCount(1);
                setNotificationRepetitionsTimeArr([]);
                setShouldGenerateRandomTime(false);
                setRandomTimeRange({start: null, end: null})
                createOrEditNotificationrefBottomModal.current.open();
              }}
              iconSize={60}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: 'red',
            alignItems: 'center',
          }}>
          <Text>No tienes notificacines crea una</Text>
          <Text style={{marginBottom: 20, marginTop: 8}}>crear</Text>
          <AddButton
            onPress={() => {
              setDeletedNotification(false);
              setEditNotification(false);
              setNotificationId('');
              setNotificationStudyTitle('');
              setNotificationStudyBody('');
              setNotificationRepetitionCount(1);
              setNotificationRepetitionsTimeArr([]);
              setShouldGenerateRandomTime(false);
              setRandomTimeRange({start: null, end: null})
              createOrEditNotificationrefBottomModal.current.open();
            }}
            iconSize={55}
          />
        </View>
      )}
      {createNotificationModal()}
      {deleteOrEditRoutineModal()}
    </View>
  );
};

export default CourseNotifications;
