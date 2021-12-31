import React, {useRef, useState, useEffect, useContext} from 'react';
import {View, Text, StyleSheet, FlatList, Alert, TextInput} from 'react-native';

import {ObjectId} from 'bson';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import LinearGradient from 'react-native-linear-gradient';

import StudyModuleContainer from '../../../../components/StudyModulesContainer';
import AddButton from '../../../../components/AddButton';
import BottomModal from '../../../../components/BottomModal';
import Button from '../../../../components/Button';

import RealmContext from '../../../../contexts/RealmContext';

import {
  icons,
  handleReadableDate,
  responsive,
  showAlert,
  scheduleExamNotif,
} from '../../../../utils';

import {useTheme, useNavigation} from '@react-navigation/native';
import moment from 'moment';

const size = responsive();

const Schedules = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const createScheduleBottomModalRef = useRef();
  const editScheduleBottomModalRef = useRef();
  const deleteOrEditScheduleBottomModalRef = useRef();

  const [userSchedules, setUserSchedules] = useState([]);

  const [editSchedule, setEditSchedule] = useState(false);

  const [scheduleId, setScheduleId] = useState('');

  const [scheduleName, setScheduleName] = useState('');
  const [scheduleAcademicStage, setScheduleAcademicStage] = useState('');

  const createScheduleModal = () => {
    const handleCreateAndSaveNewSchedule = async (name, stage) => {
      const data = {
        _id: ObjectId(),
        userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
        name: name,
        academicStage: stage,
      };

      try {
        realm.write(() => {
          realm.create('ClassSchedule', data);
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserSchedules(realm.objects('ClassSchedule'));

      createScheduleBottomModalRef.current.close();
    };

    const hanldeEditAndSaveCourse = async (name, color, icon) => {
      const data = {
        id: courseId,
        name: name,
        color: String(color),
        icon: icon,
      };
      try {
        realm.write(() => {
          realm.create('Course', data, 'modified');
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserCourses(realm.objects('Course'));

      createScheduleBottomModalRef.current.close();
    };
    return (
      <BottomModal
        openModal={createScheduleBottomModalRef}
        // keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={160}
        borderRadiusTop={10}
        closeDragDown={false}
        content={
          <View>
            <TextInput
              autoFocus
              value={scheduleName}
              onChangeText={value => setScheduleName(value)}
              placeholderTextColor="#ADADAF"
              placeholder="¿ Que estudias ? Ej: Psicologia"
              enablesReturnKeyAutomatically
              onSubmitEditing={() =>
                createScheduleBottomModalRef.current.close()
              }
              // onEndEditing={() => addCourserefBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <TextInput
              value={scheduleAcademicStage}
              onChangeText={value => setScheduleAcademicStage(value)}
              placeholderTextColor="#ADADAF"
              placeholder="¿ Que etapa academica estas cursando ? Ej: Semestre 1"
              enablesReturnKeyAutomatically
              onSubmitEditing={() =>
                createScheduleBottomModalRef.current.close()
              }
              // onEndEditing={() => addCourserefBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignSelf: editSchedule ? null : 'flex-end',
                justifyContent: editSchedule ? 'space-between' : null,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: null,
              }}>
              {editSchedule ? (
                <Button
                  onPress={() =>
                    showAlert(
                      'Eiminar Horario',
                      '¿Eliminar permanentemente este Horario y su contenido?',
                      () => {
                        console.log('cancelado');
                      },
                      () => {
                        console.log('eliminado');
                        handleDeleteClass();
                      },
                    )
                  }
                  content={
                    <MaterialCommunityIcons
                      name="delete-circle"
                      size={35}
                      color="red"
                    />
                  }
                />
              ) : null}
              <Button
                onPress={() =>
                  scheduleName.length > 0
                    ? editSchedule
                      ? hanldeEditAndSaveCourse(
                          scheduleName,
                          scheduleAcademicStage,
                        )
                      : handleCreateAndSaveNewSchedule(
                          scheduleName,
                          scheduleAcademicStage,
                        )
                    : Alert.alert('Introduce nombre')
                }
                content={
                  editSchedule ? (
                    <MaterialCommunityIcons
                      name="circle-edit-outline"
                      size={34}
                      color="lightblue"
                    />
                  ) : (
                    <Ionicons
                      name="md-arrow-up-circle"
                      size={35}
                      color="lightblue"
                    />
                  )
                }
              />
            </View>
          </View>
        }
      />
    );
  };

  const editScheduleModal = () => {
    const hanldeEditAndSaveSchedule = async (name, color, icon) => {
      const data = {
        id: courseId,
        name: name,
        color: String(color),
        icon: icon,
      };
      try {
        realm.write(() => {
          realm.create('Course', data, 'modified');
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserCourses(realm.objects('Course'));

      editScheduleBottomModalRef.current.close();
    };
    return (
      <BottomModal
        openModal={editScheduleBottomModalRef}
        // keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={160}
        borderRadiusTop={10}
        closeDragDown={false}
        content={
          <View>
            <TextInput
              autoFocus
              value={scheduleName}
              onChangeText={value => setScheduleName(value)}
              placeholderTextColor="#ADADAF"
              placeholder="¿ Que estudias ? Ej: Psicologia"
              enablesReturnKeyAutomatically
              onSubmitEditing={() =>
                editScheduleBottomModalRef.current.close()
              }
              // onEndEditing={() => addCourserefBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <TextInput
              value={scheduleAcademicStage}
              onChangeText={value => setScheduleAcademicStage(value)}
              placeholderTextColor="#ADADAF"
              placeholder="¿ Que etapa academica estas cursando ? Ej: Semestre 1"
              enablesReturnKeyAutomatically
              onSubmitEditing={() =>
                editScheduleBottomModalRef.current.close()
              }
              // onEndEditing={() => addCourserefBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignSelf: editSchedule ? null : 'flex-end',
                justifyContent: editSchedule ? 'space-between' : null,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: null,
              }}>
              {editSchedule ? (
                <Button
                  onPress={() =>
                    showAlert(
                      'Eiminar Horario',
                      '¿Eliminar permanentemente este Horario y su contenido?',
                      () => {
                        console.log('cancelado');
                      },
                      () => {
                        console.log('eliminado');
                        handleDeleteClass();
                      },
                    )
                  }
                  content={
                    <MaterialCommunityIcons
                      name="delete-circle"
                      size={35}
                      color="red"
                    />
                  }
                />
              ) : null}
              <Button
                onPress={() =>
                  scheduleName.length > 0
                    ? editSchedule
                      ? hanldeEditAndSaveCourse(
                          scheduleName,
                          scheduleAcademicStage,
                        )
                      : handleCreateAndSaveNewSchedule(
                          scheduleName,
                          scheduleAcademicStage,
                        )
                    : Alert.alert('Introduce nombre')
                }
                content={
                  editSchedule ? (
                    <MaterialCommunityIcons
                      name="circle-edit-outline"
                      size={34}
                      color="lightblue"
                    />
                  ) : (
                    <Ionicons
                      name="md-arrow-up-circle"
                      size={35}
                      color="lightblue"
                    />
                  )
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


    const handleDeleteClass = async (id) => {

      try {
        realm.write(() => {
          const foundSchedule = realm.objectForPrimaryKey('ClassSchedule', id);

          realm.delete(foundSchedule);
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserSchedules(realm.objects('ClassSchedule'));

      createScheduleBottomModalRef.current.close();
    };

    return (
      <BottomModal
        openModal={deleteOrEditScheduleBottomModalRef}
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
                setEditSchedule(false);
                showAlert(
                  'Eiminar Notificacion',
                  '¿Deseas Eliminar permanentemente la notificacion?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteClass(scheduleId);
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
                    Delete Schedule
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
                setEditSchedule(true);
                editScheduleBottomModalRef.current.open();
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
                    Edit Schedule
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
            {editScheduleModal()}
          </View>
        }
      />
    );
  };

  useEffect(() => {
    const handleGetUserSchedules = async () => {
      const foundSchedules = realm.objects('ClassSchedule');

      setUserSchedules(foundSchedules);
    };
    handleGetUserSchedules();
  }, []);

  return (
    <View style={{alignItems: 'center', backgroundColor: null, height: '100%'}}>
      <StudyModuleContainer
        fixed={true}
        backgroundFigures={
          <LinearGradient
            colors={['#F62452', '#EC6136']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{
              width: 350,
              height: 250,
              position: 'absolute',
              top: 150,
              left: -150,
              // borderRadius: 200,
              transform: [{rotate: '230deg'}],
            }}
          />
        }
        leftContent={
          <>
            <Text
              style={{
                marginVertical: 40,
                color: 'white',
                fontWeight: 'bold',
                fontSize: 45,
              }}>
              Titulo
            </Text>
            <Text style={{color: 'white'}}>
              Estudia lo que quieras via notificacines con el metodo de
              repeticion constante
            </Text>
          </>
        }
        rightContentTop={
          <>
            <MaterialCommunityIcons
              name="account-clock"
              size={50}
              color="white"
              style={{
                transform: [{rotate: '15deg'}],
                left: 35,
              }}
            />
            <MaterialCommunityIcons
              name="timetable"
              size={70}
              color="white"
              style={{
                transform: [{rotate: '-15deg'}],
                backgroundColor: 'transparent',
                bottom: 10,
                right: 10,
              }}
            />
          </>
        }
        gradientColorsArray={['#F62452', '#EC6136']}
      />
      {userSchedules.length > 0 ? (
        <View
          style={{
            width: '100%',
            height: '50%',
            paddingHorizontal: 15,
            // backgroundColor: 'red',
          }}>
          <View
            style={{
              // backgroundColor: 'blue',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginVertical: 15,
            }}>
            <Text>Schedules {userSchedules.length}</Text>
            <AddButton
              onPress={() => {
                createScheduleBottomModalRef.current.open();
                // setExamName('');
                // setExamTopic('');
                // setexamDate(0);
                // setexamTime(0);
                // setExamNotifications([]);
                // setIcon('');
              }}
              iconSize={40}
            />
          </View>
          <FlatList
            data={userSchedules}
            keyExtractor={item => item._id}
            style={
              {
                // backgroundColor: 'gray',
                // height: '100%',
                // paddingBottom: '25%',
              }
            }
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <Button
                onPress={() =>
                  navigation.navigate('classSchedules', {
                    scheduleName: item.name,
                    scheduleStage: item.academicStage,
                    schedule_Id: String(ObjectId(item._id)),
                    // schedule: JSON.stringify(item),
                  })
                }
                styleBtn={{
                  //   backgroundColor: 'red',
                  marginBottom: 25,
                  marginHorizontal: 5,
                }}
                content={
                  <View
                    style={{
                      // backgroundColor: 'lightgreen',
                      height: 90,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: colors.forms,
                      paddingHorizontal: 18,
                      paddingVertical: 15,
                      borderRadius: 17,
                    }}>
                    <View>
                      <Text>{item.name}</Text>
                      <Text>{item.academicStage}</Text>
                    </View>
                    <Button
                      onPress={() => {
                        setScheduleId(item._id);
                        setScheduleName(item.name);
                        setScheduleAcademicStage(item.academicStage);
                        deleteOrEditScheduleBottomModalRef.current.open();
                      }}
                      content={
                        <SimpleLineIcons
                          name="options-vertical"
                          color={colors.text}
                          size={20}
                        />
                      }
                    />
                  </View>
                }
              />
            )}
          />
          {/* {deleteOrEditExamModal()} */}
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          <Text style={{marginBottom: 15, fontSize: 20}}>Add Schedule</Text>
          <AddButton
            onPress={() => {
              createScheduleBottomModalRef.current.open();
              //   setExamName('');
              //   setExamTopic('');
              //   setexamDate(0);
              //   setexamTime(0);
              //   setExamNotifications([]);
              //   setIcon('');
            }}
            iconSize={60}
          />
        </View>
      )}
      {createScheduleModal()}
      {deleteOrEditRoutineModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: null,
    width: '100%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Schedules;
