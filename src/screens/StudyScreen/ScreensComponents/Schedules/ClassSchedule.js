import React, {useState, useRef, useContext, useEffect} from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
  TextInput,
} from 'react-native';

import {v4 as uuidv4} from 'uuid';

import {ObjectId} from 'bson';

import RealmContext from '../../../../contexts/RealmContext';

import {TabView, SceneMap} from 'react-native-tab-view';
import DateTimePicker from '@react-native-community/datetimepicker';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import AddButton from '../../../../components/AddButton';
import BottomModal from '../../../../components/BottomModal';
import TextModal from '../../../../components/BottomModal/textModal';
import SubmitButtons from '../../../../components/BottomModal/submitButtons';
import Button from '../../../../components/Button';

import {
  classColors,
  icons,
  showAlert,
  responsive,
  handleReadableDate,
} from '../../../../utils';

import {useTheme} from '@react-navigation/native';

const size = responsive();

const Timetable = ({route}) => {
  const {colors} = useTheme();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const {schedule_Id, scheduleName, scheduleStage} = route.params;

  const [scheduleLessons, setScheduleLessons] = useState([]);

  useEffect(() => {
    console.log('USEEFECT');
    console.log(ObjectId(schedule_Id));

    realm.write(() => {
      const schedulefound = realm.objectForPrimaryKey(
        'ClassSchedule',
        ObjectId(schedule_Id),
      );
      setScheduleLessons(schedulefound.lessons);
    });

  }, [helperScheduleClasses]);


  const [userScheduleClasses, setUserScheduleClasses] = useState([]);

  const [helperScheduleClasses, setHelperScheduleClasses] = useState(false);

  const [editClass, setEditClass] = useState(false);

  const [classId, setClassId] = useState('');

  const [className, setClassName] = useState('');
  const [classInfo, setClassInfo] = useState('');
  const [classStartTime, setClassStartTime] = useState(null);
  const [classFinishTime, setClassFinishTime] = useState(null);
  const [selectedColorPosition, setSelectedColorPosition] = useState('#CF271E');

  const openModalRef = useRef();
  const editClassBottomModalRef = useRef();
  const selectStartTimeClassModalRef = useRef();
  const selectFinishTimeClassModalRef = useRef();
  const deleteOrEditClassBottomModalRef = useRef();

  const selectStartTimeClassBottomModal = () => {
    return (
      <BottomModal
        openModal={selectStartTimeClassModalRef}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={5}
        closeDragDown={true}
        closeDragTopOnly={true}
        content={
          <View>
            <TextModal text="Start Time" textTitle={true} />
            <DateTimePicker
              testID="dateTimePicker"
              value={!classStartTime ? new Date(Date.now()) : classStartTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setClassStartTime(selectedDate);
                console.log('TIME33', selectedDate);
                console.log('LA DATE3333', selectedDate.getFullYear());
                console.log('LA TIME33', selectedDate.getHours());
              }}
            />
            <SubmitButtons
              leftButtonFunction={() =>
                selectStartTimeClassModalRef.current.close()
              }
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                selectStartTimeClassModalRef.current.close()
              }
              rightButtonText="Select"
            />
          </View>
        }
      />
    );
  };

  const selectFinishTimeClassBottomModal = () => {
    return (
      <BottomModal
        openModal={selectFinishTimeClassModalRef}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={5}
        closeDragDown={true}
        closeDragTopOnly={true}
        content={
          <View>
            <TextModal text="Finish Time" textTitle={true} />
            <DateTimePicker
              testID="dateTimePicker"
              value={!classFinishTime ? new Date(Date.now()) : classFinishTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setClassFinishTime(selectedDate);
                console.log('TIME33', selectedDate);
                console.log('LA DATE3333', selectedDate.getFullYear());
                console.log('LA TIME33', selectedDate.getHours());
              }}
            />
            <SubmitButtons
              leftButtonFunction={() =>
                selectFinishTimeClassModalRef.current.close()
              }
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                selectFinishTimeClassModalRef.current.close()
              }
              rightButtonText="Select"
            />
          </View>
        }
      />
    );
  };

  const addClass = () => {
    const handleCreateAndSaveNewClass = (name, color, info, start, finish) => {
      try {
        realm.write(() => {
          const scheduleToAddClass = realm.objectForPrimaryKey(
            'ClassSchedule',
            ObjectId(schedule_Id),
          );
          scheduleToAddClass.lessons.push({
            id: uuidv4(),
            name: name,
            color: color,
            info: info,
            day: index,
            startTime: start,
            finishTime: finish,
          });
        });

        setHelperScheduleClasses(!helperScheduleClasses);

        openModalRef.current.close();
      } catch (error) {
        console.log('ERR ON CREATE SCHEDULE CLASS', error);
      }
    };

    return (
      <BottomModal
        openModal={openModalRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={630}
        borderRadiusTop={25}
        closeDragDown={true}
        closeDragTopOnly={false}
        customPaddingHorizontal={true}
        content={
          <View>
            <TextModal text="Create new Class" textTitle={true} />
            <TextModal text="Name" textTitle={false} />
            <TextInput
              value={className}
              onChangeText={value => setClassName(value)}
              placeholder="Math"
              style={{
                backgroundColor: colors.forms,
                paddingHorizontal: 25,
                paddingVertical: 15,
                borderRadius: 10,
                marginBottom: 5,
              }}
            />
            <TextModal text="Info" textTitle={false} />
            <TextInput
              value={classInfo}
              onChangeText={value => setClassInfo(value)}
              placeholder="In this class..."
              style={{
                backgroundColor: colors.forms,
                paddingHorizontal: 25,
                height: 75,
                paddingVertical: 15,
                borderRadius: 10,
                marginBottom: 5,
              }}
            />
            <TextModal text="Start Time" textTitle={false} />
            <Button
              onPress={() => selectStartTimeClassModalRef.current.open()}
              content={
                classStartTime ? (
                  <Text>
                    {handleReadableDate(
                      new Date(classStartTime).getHours(),
                      new Date(classStartTime).getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Class Start Time</Text>
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
            <TextModal text="Finish Time" textTitle={false} />
            <Button
              onPress={() => selectFinishTimeClassModalRef.current.open()}
              content={
                classFinishTime ? (
                  <Text>
                    {handleReadableDate(
                      new Date(classStartTime).getHours(),
                      new Date(classStartTime).getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Class Finish Time</Text>
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
            {selectStartTimeClassBottomModal()}
            {selectFinishTimeClassBottomModal()}
            <TextModal text="Color" textTitle={false} />
            <FlatList
              data={classColors}
              keyExtractor={item => item.color}
              horizontal
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) =>
                item.color === selectedColorPosition ? (
                  <Button
                    onPress={() => {
                      setSelectedColorPosition(item.color);
                    }}
                    content={
                      <View
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.text,
                          backgroundColor: item.color,
                        }}
                      />
                    }
                    styleBtn={{
                      backgroundColor: 'red',
                      width: 60,
                      marginHorizontal: 5,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <Button
                    onPress={() => {
                      setSelectedColorPosition(item.color);
                    }}
                    content={
                      <View
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.background,
                          backgroundColor: item.color,
                        }}
                      />
                    }
                    styleBtn={{
                      backgroundColor: 'red',
                      width: 60,
                      marginHorizontal: 5,
                      borderRadius: 8,
                    }}
                  />
                )
              }
            />
            <SubmitButtons
              leftButtonFunction={() => openModalRef.current.close()}
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                handleCreateAndSaveNewClass(
                  className,
                  selectedColorPosition,
                  classInfo,
                  classStartTime,
                  classFinishTime,
                )
              }
              rightButtonText="Create"
            />
          </View>
        }
      />
    );
  };

  const editClassFunc = () => {
    const hanldeEditAndSaveClass = async (name, color, info, start, finish) => {
      const foundClass = scheduleLessons.find(item => item.id === classId);
      try {
        realm.write(() => {
          foundClass.name = name;
          foundClass.color = color;
          foundClass.info = info;
          foundClass.day = index;
          foundClass.startTime = start;
          foundClass.finishTime = finish;
        });
        setHelperScheduleClasses(!helperScheduleClasses);
        editClassBottomModalRef.current.close();
      } catch (error) {
        console.log('ERR', error);
      }
    };

    return (
      <BottomModal
        openModal={editClassBottomModalRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={630}
        borderRadiusTop={25}
        closeDragDown={true}
        closeDragTopOnly={false}
        customPaddingHorizontal={true}
        content={
          <View>
            <TextModal text="Edit Class" textTitle={true} />
            <TextModal text="Name" textTitle={false} />
            <TextInput
              value={className}
              onChangeText={value => setClassName(value)}
              placeholder="Math"
              style={{
                backgroundColor: colors.forms,
                paddingHorizontal: 25,
                paddingVertical: 15,
                borderRadius: 10,
                marginBottom: 5,
              }}
            />
            <TextModal text="Info" textTitle={false} />
            <TextInput
              value={classInfo}
              onChangeText={value => setClassInfo(value)}
              placeholder="In this class..."
              style={{
                backgroundColor: colors.forms,
                paddingHorizontal: 25,
                height: 75,
                paddingVertical: 15,
                borderRadius: 10,
                marginBottom: 5,
              }}
            />
            <TextModal text="Start Time" textTitle={false} />
            <Button
              onPress={() => selectStartTimeClassModalRef.current.open()}
              content={
                classStartTime ? (
                  <Text>
                    {handleReadableDate(
                      new Date(classStartTime).getHours(),
                      new Date(classStartTime).getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Class Start Time</Text>
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
            <TextModal text="Finish Time" textTitle={false} />
            <Button
              onPress={() => selectFinishTimeClassModalRef.current.open()}
              content={
                classFinishTime ? (
                  <Text>
                    {handleReadableDate(
                      new Date(classStartTime).getHours(),
                      new Date(classStartTime).getMinutes(),
                    )}
                  </Text>
                ) : (
                  <Text>Select Class Finish Time</Text>
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
            {selectStartTimeClassBottomModal()}
            {selectFinishTimeClassBottomModal()}
            <TextModal text="Color" textTitle={false} />
            <FlatList
              data={classColors}
              keyExtractor={item => item.color}
              horizontal
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) =>
                item.color === selectedColorPosition ? (
                  <Button
                    onPress={() => {
                      setSelectedColorPosition(item.color);
                    }}
                    content={
                      <View
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.text,
                          backgroundColor: item.color,
                        }}
                      />
                    }
                    styleBtn={{
                      backgroundColor: 'red',
                      width: 60,
                      marginHorizontal: 5,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <Button
                    onPress={() => {
                      setSelectedColorPosition(item.color);
                    }}
                    content={
                      <View
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.background,
                          backgroundColor: item.color,
                        }}
                      />
                    }
                    styleBtn={{
                      backgroundColor: 'red',
                      width: 60,
                      marginHorizontal: 5,
                      borderRadius: 8,
                    }}
                  />
                )
              }
            />
            <SubmitButtons
              leftButtonFunction={() => editClassBottomModalRef.current.close()}
              leftButtonText="Cancel"
              rightButtonFunction={() =>
                hanldeEditAndSaveClass(
                  className,
                  selectedColorPosition,
                  classInfo,
                  classStartTime,
                  classFinishTime,
                )
              }
              rightButtonText="Edit"
            />
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

    const handleDeleteClass = async class_id => {
      try {
        realm.write(() => {
          const schedulefound = realm.objectForPrimaryKey(
            'ClassSchedule',
            ObjectId(schedule_Id),
          );
          console.log(
            'removed',
            schedulefound.lessons.filter(item => item.id !== class_id),
          );

          let removedClass = [];
          removedClass = schedulefound.lessons.filter(
            item => item.id !== class_id,
          );

          // schedulefound.notificationsStudy = [];

          console.log('REMOVEDClass', removedClass);

          let removedClass_helper = [];

          removedClass.map(item =>
            removedClass_helper.push({
              id: item.id,
              name: item.name,
              color: item.color,
              info: item.info,
              day: item.day,
              startTime: item.startTime,
              finishTime: item.finishTime,
            }),
          );

          console.log('removedClass_helper', removedClass_helper);

          schedulefound.lessons = removedClass_helper;

          // arrtest.push(schedulefound.notificationsStudy.filter((item) => item.id !== notiId))
          // console.log('arrtest', arrtest.map((item) => item))
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setHelperScheduleClasses(!helperScheduleClasses);

      deleteOrEditClassBottomModalRef.current.close();
    };

    return (
      <BottomModal
        openModal={deleteOrEditClassBottomModalRef}
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
                setEditClass(false);
                showAlert(
                  'Eiminar Clase',
                  '¿Deseas Eliminar permanentemente la clase?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteClass(classId);
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
                    Delete Class
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
                setEditClass(true);
                editClassBottomModalRef.current.open();
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
                    Edit Class
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
            {editClassFunc()}
          </View>
        }
      />
    );
  };

  const TimeTableStructutreUI = () => {
    return (
      <View style={{width: '100%', height: '100%', backgroundColor: null}}>
        <FlatList
          data={scheduleLessons.filter(item => item.day === index)}
          keyExtractor={item => item.id}
          numColumns={1}
          style={{backgroundColor: 'blue'}}
          renderItem={({item}) => (
            <Button
              customDisable={true}
              onPress={() => {}}
              content={
                <View
                  style={{
                    backgroundColor: item.color,
                    height: 100,
                    padding: 30,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View>
                    <Text>{item.name}</Text>
                    <View
                      style={styles.course_time}>
                      <Text>
                        {handleReadableDate(
                          new Date(item.startTime).getHours(),
                          new Date(item.startTime).getMinutes(),
                        )}
                      </Text>
                      <Text>
                        {handleReadableDate(
                          new Date(item.finishTime).getHours(),
                          new Date(item.finishTime).getMinutes(),
                        )}
                      </Text>
                    </View>
                  </View>
                  <Button
                    onPress={() => {
                      // setExamId(item._id);
                      // setOldExamNotifId(item.notificationId);
                      // setExamName(item.courseName);
                      // setExamTopic(item.courseTopic);
                      // setexamDate(item.date);
                      // setexamTime(item.time);
                      // setExamNotifications(item.notifications);
                      // setIcon(item.icon);
                      setClassId(item.id);
                      setClassName(item.name);
                      setSelectedColorPosition(item.color);
                      setClassInfo(item.info);
                      setClassStartTime(item.startTime);
                      setClassFinishTime(item.finishTime);
                      deleteOrEditClassBottomModalRef.current.open();
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
              // styleBtn={styles.button_course_container}
            />
          )}
        />
        <View style={styles.bottom_button}>
          <AddButton
            onPress={() => {
              openModalRef.current.open();
            }}
            iconSize={60}
          />
        </View>
      </View>
    );
  };

  const FirstRoute = () => <TimeTableStructutreUI />;
  const SecondRoute = () => <TimeTableStructutreUI />;
  const ThirdRoute = () => <TimeTableStructutreUI />;
  const FourRoute = () => <TimeTableStructutreUI />;
  const FiveRoute = () => <TimeTableStructutreUI />;
  const SixRoute = () => <TimeTableStructutreUI />;
  const SevenRoute = () => <TimeTableStructutreUI />;

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    {key: 'first', title: 'D'},
    {key: 'second', title: 'L'},
    {key: 'third', title: 'M'},
    {key: 'four', title: 'Mi'},
    {key: 'five', title: 'J'},
    {key: 'six', title: 'V'},
    {key: 'seven', title: 'S'},
  ]);

  // state = {
  //   index: 0,
  //   routes: [
  //     {key: 'first', title: 'D'},
  //     {key: 'second', title: 'L'},
  //     {key: 'third', title: 'M'},
  //     {key: 'four', title: 'Mi'},
  //     {key: 'five', title: 'J'},
  //     {key: 'six', title: 'V'},
  //     {key: 'seven', title: 'S'},
  //   ],
  // };

  const _handleIndexChange = index => setIndex(index);

  const _renderTabBar = props => {
    const inputRange = routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map(inputIndex =>
              inputIndex === i ? 1 : 0.4,
            ),
          });

          return (
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setIndex(i)}>
              <Animated.Text style={{opacity}}>{route.title}</Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const _renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    four: FourRoute,
    five: FiveRoute,
    six: SixRoute,
    seven: SevenRoute,
  });
  return (
    <>
      <Text
        style={{
          textAlign: 'center',
        }}>
        {scheduleName} {scheduleStage}
      </Text>
      <TabView
        navigationState={{index, routes}}
        renderScene={_renderScene}
        renderTabBar={item => _renderTabBar(item)}
        onIndexChange={_handleIndexChange}
      />
      {addClass()}
      {deleteOrEditRoutineModal()}
    </>
  );
};

let button_course_container_size;
let button_course_container_marginLeft;
let button_course_container_marginVertical;
let course_time_info_width;

let bottom_button_top;
let bottom_button_left;

if (size === 'small') {
} else if (size === 'medium') {
  bottom_button_top = '88%';
  bottom_button_left = '82%';
  course_time_info_width = '55%';
} else {
  //large screen
  button_course_container_size = 195;
  button_course_container_marginLeft = 8;
  button_course_container_marginVertical = 8;
  course_time_info_width = '50%';

  bottom_button_top = '85%';
  bottom_button_left = '82%';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  bottom_button: {
    position: 'absolute',
    alignItems: 'flex-end',
    top: bottom_button_top,
    left: bottom_button_left,
  },
  course_time: {
    width: course_time_info_width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'gray'
  }
});

export default Timetable;
