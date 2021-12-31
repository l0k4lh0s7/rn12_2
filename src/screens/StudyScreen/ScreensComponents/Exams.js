import React, {useRef, useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';

import {ObjectId} from 'bson';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {getRealm} from '../../../services/realm';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import LinearGradient from 'react-native-linear-gradient';
import CountDown from 'react-native-countdown-component';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectMultiple from 'react-native-select-multiple';

import ReactNativeAN from 'react-native-alarm-notification';
import BackgroundTimer from 'react-native-background-timer';

import StudyModuleContainer from '../../../components/StudyModulesContainer';
import AddButton from '../../../components/AddButton';
import BottomModal from '../../../components/BottomModal';
import TextModal from '../../../components/BottomModal/textModal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SubmitButtons from '../../../components/BottomModal/submitButtons';
import {IconsSwitchSelector} from '../../../components/SwitchSelector/CustomSwitchSelector';

import RealmContext from '../../../contexts/RealmContext';

import {icons, handleReadableDate, responsive, showAlert, scheduleExamNotif} from '../../../utils';

import {useTheme} from '@react-navigation/native';
import moment from 'moment';

const size = responsive();

const Exams = () => {
  const {colors} = useTheme();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [userExams, setUserExams] = useState([]);

  const newExamRef = useRef();

  const [date, setDate] = useState(new Date(Date.now()));
  const [show, setShow] = useState(false);

  const [examId, setExamId] = useState('');
  const [oldExamNotifIds, setOldExamNotifIds] = useState([]);
  const [examName, setExamName] = useState('');
  const [examTopic, setExamTopic] = useState('');
  const [examDate, setexamDate] = useState(null);
  const [examTime, setexamTime] = useState(null);
  const [icon, setIcon] = useState('access-time');
  const [examNotifications, setExamNotifications] = useState([]);

  const [editExam, setEditExam] = useState(false);
  const editExamRef = useRef();

  const selectConcentrationTimePomodoroRef = useRef();
  const selectBreakTimePomodoroRef = useRef();
  const selectNotificationsPomodoroRef = useRef();
  const deleteOrEditExamBottomModal = useRef();

  // const onChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || date;
  //   setShow(Platform.OS === 'ios');
  //   setDate(currentDate);
  //   console.log(selectedDate.getHours());
  //   console.log(selectedDate.getMinutes());
  //   console.log(selectedDate.getFullYear());
  // };

  const getExamNotifDateTimeInMillis = _ => {
    const notifsDateInMillis = examNotifications.map(x => x.value * 24 * 60 * 60 * 1000);
    const examDateInMillis = (moment(examDate).set('hour', examTime.getHours()).set('minute', examTime.getMinutes()).set('second', 0).unix() * 1000);
    return notifsDateInMillis.map(x => examDateInMillis - x);
  }


  const handleCreateAndSaveNewExam = async () => {
    if (!examDate || !examTime) {
      Alert.alert('Please select date and time');
      return;
    }

    const realm =  await getRealm();

    //in examNotifications array is when the user wants to be notified prior to his exam, eg 1 month, the user must be notified one month before the date he has established for his exam, If the exam is deleted before triggering the notifications, the saved notifications should also be cleared
      const data = {
        _id: ObjectId(),
        userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
        courseName: examName,
        courseTopic: examTopic,
        date: examDate,
        time: examTime,
        icon: icon,
        notifications: examNotifications,
        notificationIds: [],
        notifFireDatesInMillis: getExamNotifDateTimeInMillis(),
      };
      
      scheduleExamNotif(data, false, (mExamData) => {
        try {
          realm.write(() => {
            realm.create('Exams', mExamData);
          });
        } catch (error) {
          console.log('ERR', error);
        }
        setUserExams(realm.objects('Exams'));
        newExamRef.current.close();
      });
  
  };

  const handleUpdateExam = async () => {
    if (!examDate || !examTime) {
      Alert.alert('Please select date and time');
      return;
    }

    const data = {
      notificationIds: oldExamNotifIds,
      notifFireDatesInMillis: getExamNotifDateTimeInMillis()
    };

    const realm = await getRealm();

    if (!examDate || !examTime) {
      Alert.alert('Please select date and time');
      return;
    }

    scheduleExamNotif(data, false, (mExamData) => {
      try {
        realm.write(() => {
          const foundExam = realm.objectForPrimaryKey('Exams', examId);
          foundExam.courseName = examName;
          foundExam.courseTopic = examTopic;
          foundExam.date = examDate;
          foundExam.time = examTime;
          foundExam.icon = icon;
          foundExam.notificationIds = mExamData.notificationIds;
          foundExam.notifFireDatesInMillis = mExamData.notifFireDatesInMillis;
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserExams(realm.objects('Exams'));

      editExamRef.current.close();
    });
  };

  const handleDeleteExam = async () => {
    const realm = await getRealm();
    scheduleExamNotif({notificationIds: oldExamNotifIds}, true, (mExamData) => {
      try {
        realm.write(() => {
          const foundExam = realm.objectForPrimaryKey('Exams', examId);
          realm.delete(foundExam);
          console.log('fooundEXAM ANTE DEL FINAL', foundExam);
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserExams(realm.objects('Exams'));

      deleteOrEditExamBottomModal.current.close();
    });
  };

  const selectexamDateBottomModal = () => {
    return (
      <BottomModal
        openModal={selectConcentrationTimePomodoroRef}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={5}
        closeDragDown={true}
        closeDragTopOnly={true}
        content={
          <View>
            <TextModal text="Exam Date" textTitle={true} />
            <DateTimePicker
              testID="dateTimePicker"
              value={ !examDate ? new Date(Date.now()) : examDate}
              mode="date"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setexamDate(selectedDate);
                console.log('LA DATE date year', selectedDate.getFullYear());
                console.log('LA DATE date month', selectedDate.getMonth());
                console.log('LA DATE date hour', selectedDate.getHours());
                console.log('LA DATE date minute', selectedDate.getMinutes());
                console.log(typeof selectedDate.getFullYear());
                console.log(selectedDate);
              }}
            />
            <SubmitButtons
              leftButtonFunction={() =>
                selectConcentrationTimePomodoroRef.current.close()
              }
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                selectConcentrationTimePomodoroRef.current.close()
              }
              rightButtonText="Select"
            />
          </View>
        }
      />
    );
  };

  const selectexamTimeBottomModal = () => {
    return (
      <BottomModal
        openModal={selectBreakTimePomodoroRef}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={5}
        closeDragDown={true}
        closeDragTopOnly={true}
        content={
          <View>
            <TextModal text="Exam Time" textTitle={true} />
            <DateTimePicker
              testID="dateTimePicker"
              value={ !examTime ? new Date(Date.now()) : examTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setexamTime(selectedDate);
                console.log('TIME33', selectedDate);
                console.log('LA DATE3333', selectedDate.getFullYear());
                console.log('LA TIME33', selectedDate.getHours());
              }}
            />
            <SubmitButtons
              leftButtonFunction={() =>
                selectBreakTimePomodoroRef.current.close()
              }
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                selectBreakTimePomodoroRef.current.close()
              }
              rightButtonText="Select"
            />
          </View>
        }
      />
    );
  };

  const selectexamNotificationsBottomModal = () => {
    return (
      <BottomModal
        openModal={selectNotificationsPomodoroRef}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={5}
        closeDragDown={true}
        closeDragTopOnly={true}
        content={
          <View>
            <TextModal text="Exam Notifications" textTitle={true} />
            <View
              style={{
                // backgroundColor: 'red',
                height: 200,
              }}>
              <SelectMultiple
                items={NotificationsExamOptions()}
                selectedItems={examNotifications}
                onSelectionsChange={selected => {
                  console.log(selected);
                  setExamNotifications(selected);
                }}
              />
            </View>
            <SubmitButtons
              leftButtonFunction={() =>
                selectNotificationsPomodoroRef.current.close()
              }
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                selectNotificationsPomodoroRef.current.close()
              }
              rightButtonText="Select"
            />
          </View>
        }
      />
    );
  };

  const CreateNewExamModalView = () => {
    return (
      <BottomModal
        openModal={newExamRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={740}
        borderRadiusTop={40}
        closeDragDown={true}
        customPaddingHorizontal={true}
        content={
          <View>
            <TextModal text="Create new Exam" textTitle={true} />
            <TextModal text="Course" textTitle={false} />
            <Input
              inputValue={examName}
              inputValueOnChange={value => setExamName(value)}
              placeHolder="Math"
              customHeight={45}
              customBorderRadius={10}
            />
            <TextModal text="Name" textTitle={false} />
            <Input
              inputValue={examTopic}
              inputValueOnChange={value => setExamTopic(value)}
              placeHolder="Algebra"
              customHeight={45}
              customBorderRadius={10}
            />
            <TextModal text="Date" textTitle={false} />
            <Button
              onPress={() => selectConcentrationTimePomodoroRef.current.open()}
              content={
                examDate ? (
                  <Text>
                    {`${examDate.getDate()} / ${
                      examDate.getMonth() + 1
                    } / ${examDate.getFullYear()}`}
                  </Text>
                ) : (
                  <Text>Select Exam Date</Text>
                )
              }
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />

            <TextModal text="Time" textTitle={false} />
            <Button
              onPress={() => selectBreakTimePomodoroRef.current.open()}
              content={
                examTime ? (
                  <Text>
                    {handleReadableDate(
                      examTime.getHours(),
                      examTime.getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Exam Time</Text>
                )
              }
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />
            <TextModal text="Icon" textTitle={false} />
            <IconsSwitchSelector
              dataOptions={icons}
              horizontalOptions={true}
              passSelectedValue={value => setIcon(value)}
            />
            <TextModal text="Notifications" textTitle={false} />
            <Button
              onPress={() => selectNotificationsPomodoroRef.current.open()}
              content={<Text>Select Notifications</Text>}
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />
            {selectexamDateBottomModal()}
            {selectexamTimeBottomModal()}
            {selectexamNotificationsBottomModal()}
            <SubmitButtons
              leftButtonFunction={() => newExamRef.current.close()}
              leftButtonText="Cancel"
              rightButtonFunction={handleCreateAndSaveNewExam}
              rightButtonText="Create"
            />
          </View>
        }
      />
    );
  };

  const EditExamModalView = () => {
    return (
      <BottomModal
        openModal={editExamRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={740}
        borderRadiusTop={40}
        closeDragDown={true}
        customPaddingHorizontal={true}
        content={
          <View>
            <TextModal text="Edit Exam" textTitle={true} />
            <TextModal text="Course" textTitle={false} />
            <Input
              inputValue={examName}
              inputValueOnChange={value => setExamName(value)}
              placeHolder="Math"
              customHeight={45}
              customBorderRadius={10}
            />
            <TextModal text="Name" textTitle={false} />
            <Input
              inputValue={examTopic}
              inputValueOnChange={value => setExamTopic(value)}
              placeHolder="Algebra"
              customHeight={45}
              customBorderRadius={10}
            />
            <TextModal text="Date" textTitle={false} />
            <Button
              onPress={() => selectConcentrationTimePomodoroRef.current.open()}
              content={
                examDate ? (
                  <Text>
                    {`${examDate.getDate()} / ${
                      examDate.getMonth() + 1
                    } / ${examDate.getFullYear()}`}
                  </Text>
                ) : (
                  <Text>Select Exam Date</Text>
                )
              }
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />

            <TextModal text="Time" textTitle={false} />
            <Button
              onPress={() => selectBreakTimePomodoroRef.current.open()}
              content={
                examTime ? (
                  <Text>
                    {handleReadableDate(
                      examTime.getHours(),
                      examTime.getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Exam Time</Text>
                )
              }
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />
            <TextModal text="Icon" textTitle={false} />
            <IconsSwitchSelector
              dataOptions={icons}
              horizontalOptions={true}
              passSelectedValue={value => setIcon(value)}
            />
            <TextModal text="Notifications" textTitle={false} />
            <Button
              onPress={() => selectConcentrationTimePomodoroRef.current.open()}
              content={
                examDate ? (
                  <Text>Focus: {Math.floor(examDate / 60)} Minutes</Text>
                ) : (
                  <Text>Select Notifications</Text>
                )
              }
              styleBtn={{
                backgroundColor: colors.forms,
                borderRadius: 9,
                paddingHorizontal: 25,
                paddingVertical: 13,
                // marginBottom: 8,
                alignItems: 'center',
              }}
            />
            {selectexamDateBottomModal()}
            {selectexamTimeBottomModal()}
            <SubmitButtons
              leftButtonFunction={() => editExamRef.current.close()}
              leftButtonText="Cancel"
              rightButtonFunction={handleUpdateExam}
              rightButtonText="Edit"
              edit={true}
            />
          </View>
        }
      />
    );
  };

  const deleteOrEditExamModal = () => {
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
        openModal={deleteOrEditExamBottomModal}
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
                setEditExam(false);
                showAlert(
                  'Eiminar Examen',
                  '¿Deseas eliminarlo permanentemente?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteExam();
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
                  <View
                    style={{
                      backgroundColor: colors.forms,
                      marginRight: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 13,
                      borderRadius: 13,
                    }}>
                    <FontAwesome
                      name="trash"
                      color={colors.text}
                      size={30}
                      style={{}}
                    />
                  </View>
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Delete Exam
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
                setEditExam(true);
                editExamRef.current.open();
              }}
              content={
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'pink',
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.forms,
                      marginRight: 15,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      borderRadius: 13,
                    }}>
                    <MaterialCommunityIcons
                      name="circle-edit-outline"
                      color={colors.text}
                      size={30}
                      style={{}}
                    />
                  </View>
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Edit Exam
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
            {EditExamModalView()}
          </View>
        }
      />
    );
  };

  const HowMuchTimeIsLeftForTheExamInSeconds = (date, time) => {
    const currentDate = new Date(Date.now());

    var date1 = new Date(Date.now());

    // MONTHS 0 TO 11
    let date_month_0_11 = date.getMonth() + 1;
    var date2 = new Date(
      `${date.getFullYear()}/${
        date_month_0_11.length === 1 ? '0' + date_month_0_11 : date_month_0_11
      }/${date.getDate()} ${
        time.length === 1 ? '0' + time.getHours() : time.getHours()
      }:${time.length === 1 ? '0' + time.getMinutes() : time.getMinutes()}:00`,
    ); //less than 1

    // var date2 = new Date(`${date.getFullYear()}/${date.length === 1 ? '0'+date.getMonth() : date.getMonth()}/${date.length === 1 ?  '0' + date.getDate() : date.getDate()} ${time.length === 1 ? '0'+time.getHours() : time.getHours()}:${time.length === 1 ? '0'+time.getMinutes() : time.getMinutes()}:00`); //less than 1
    var start = date1.getTime() / (3600 * 24 * 1000); //days as integer from..
    var end = date2.getTime() / (3600 * 24 * 1000); //days as integer from..
    var leftSeconds = (end - start) * 86400; // exact dates
    // console.log('in sec', leftSeconds);
    // console.log('in days', leftSeconds / 86400);

    return leftSeconds;
  };

  const NotificationsExamOptions = () => {
    const options = [
      {label: '1 Day before', value: 1},
      {label: '1 week before', value: 7},
      {label: '2 week before', value: 14},
      {label: '1 month before', value: 30},
      {label: '3 month before', value: 90},
      {label: '5 month before', value: 150},
    ];

    const available_notifications_options =
      examDate && examTime
        ? options.filter(
            item =>
              item.value <
              HowMuchTimeIsLeftForTheExamInSeconds(examDate, examTime) / 86400,
          )
        : [];

    console.log('available', available_notifications_options);

    return available_notifications_options;
  };

  useEffect(() => {
    const handleGetUserExams = async () => {
      const realm = await getRealm();

      const foundExams = realm.objects('Exams');

      setUserExams(foundExams);
    };
    handleGetUserExams();
  }, []);

  return (
    <View style={{alignItems: 'center', backgroundColor: null, height: '100%'}}>
      <StudyModuleContainer
        fixed={true}
        backgroundFigures={
          <>
            <LinearGradient
              colors={['#791BF4', '#3880EC']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                width: 250,
                height: 250,
                position: 'absolute',
                top: 150,
                left: -100,
                borderRadius: 200,
                transform: [{rotate: '230deg'}],
              }}
            />
            <LinearGradient
              colors={['#791BF4', '#3880EC']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                width: 250,
                height: 250,
                position: 'absolute',
                bottom: 150,
                left: 230,
                borderRadius: 200,
                transform: [{rotate: '200deg'}],
              }}
            />
          </>
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
            <Ionicons
              name="calendar"
              size={50}
              color="white"
              style={{
                transform: [{rotate: '15deg'}],
                left: 35,
              }}
            />
            <MaterialCommunityIcons
              name="file-clock"
              size={70}
              color="white"
              style={{
                transform: [{rotate: '-15deg'}],
                backgroundColor: 'transparent',
                bottom: 20,
                right: 10,
              }}
            />
          </>
        }
        gradientColorsArray={['#791BF4', '#3880EC']}
      />
      {userExams.length > 0 ? (
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
            <Text>Exams {userExams.length}</Text>
            <AddButton
              onPress={() => {
                newExamRef.current.open();
                setExamName('');
                setExamTopic('');
                setexamDate(0);
                setexamTime(0);
                setExamNotifications([]);
                setIcon('');
              }}
              iconSize={40}
            />
          </View>
          <FlatList
            data={userExams}
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
              <View>
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
                    marginBottom: 25,
                    marginHorizontal: 5,
                  }}>
                  <Text>{item.courseName}</Text>
                  <View
                    style={{
                      height: 90,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // justifyContent: 'space-between',
                      // paddingHorizontal: 18,
                      // paddingVertical: 15,
                      // borderRadius: 17,
                      // marginBottom: 25,
                      // marginHorizontal: 5,
                    }}>
                    <CountDown
                      size={17}
                      until={HowMuchTimeIsLeftForTheExamInSeconds(
                        item.date,
                        item.time,
                      )}
                      onFinish={() => console.info('Finished')}
                      digitStyle={
                        {
                          // backgroundColor: '#FFF',
                          // borderWidth: 2,
                          // borderColor: '#1CC625',
                        }
                      }
                      digitTxtStyle={{color: 'black'}}
                      // timeLabelStyle={{color: 'red', fontWeight: 'bold'}}
                      separatorStyle={{marginBottom: 15}}
                      timeToShow={['D', 'H', 'M', 'S']}
                      timeLabels={{
                        d: 'Days',
                        h: 'Hours',
                        m: 'Minutes',
                        s: 'Seconds',
                      }}
                      showSeparator
                    />
                    <Button
                      onPress={() => {
                        setExamId(item._id);
                        setOldExamNotifIds(item.notificationIds);
                        setExamName(item.courseName);
                        setExamTopic(item.courseTopic);
                        setexamDate(item.date);
                        setexamTime(item.time);
                        setExamNotifications(item.notifications);
                        setIcon(item.icon);
                        deleteOrEditExamBottomModal.current.open();
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
                </View>
              </View>
            )}
          />
          {deleteOrEditExamModal()}
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          <Text style={{marginBottom: 15, fontSize: 20}}>Add Exam</Text>
          <AddButton
            onPress={() => {
              newExamRef.current.open();
              setExamName('');
              setExamTopic('');
              setexamDate(0);
              setexamTime(0);
              setExamNotifications([]);
              setIcon('');
            }}
            iconSize={60}
          />
        </View>
      )}
      {CreateNewExamModalView()}
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

export default Exams;
