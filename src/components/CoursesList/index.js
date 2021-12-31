/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef, useContext} from 'react';
import {View, FlatList, Text, StyleSheet, Alert, TextInput} from 'react-native';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {ObjectId} from 'bson';

import {getRealm, getRealmApp, isLoggedIn} from '../../services/realm';

import RealmContext from '../../contexts/RealmContext';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LinearGradient from 'react-native-linear-gradient';

import AddButton from '../../components/AddButton';
import Button from '../../components/Button';
import BottomModal from '../../components/BottomModal';

import {useTheme, useNavigation} from '@react-navigation/native';

import {courseColors, icons, showAlert, responsive} from '../../utils';

const size = responsive();

const CoursesList = ({screen}) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [userCourses, setUserCourses] = useState([]);

  const [courseId, setCourseId] = useState('');
  const [courseName, setCouseName] = useState('');
  const [selectedColorPosition, setSelectedColorPosition] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('bus');

  const [editCourse, setEditCourse] = useState(false);

  const addCourserefBottomModal = useRef();

  useEffect(() => {
    setUserCourses(realm.objects('Course'));
  }, [realm]);

  const addCourseModal = () => {
    const handleCreateAndSeveNewCouse = async (name, color, icon) => {
      const data = {
        _id: ObjectId(),
        userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
        name: name.trim(),
        color: String(color),
        icon: icon,
      };

      try {
        realm.write(() => {
          realm.create('Course', data);
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserCourses(realm.objects('Course'));


      addCourserefBottomModal.current.close();
    };

    const hanldeEditAndSaveCourse = async (name, color, icon) => {
      const realm = await getRealm();

      const data = {
        _id: courseId,
        name: name.trim(),
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

      addCourserefBottomModal.current.close();
    };

    const handleDeleteTask = async () => {
      try {
        realm.write(() => {
          const foundCourse = realm.objectForPrimaryKey('Course', courseId);
          realm.delete(foundCourse);
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setUserCourses(realm.objects('Course'));

      addCourserefBottomModal.current.close();
    };

    return (
      <BottomModal
        openModal={addCourserefBottomModal}
        // keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={180}
        borderRadiusTop={10}
        closeDragDown={false}
        content={
          <View>
            <TextInput
              autoFocus
              value={courseName}
              onChangeText={value => setCouseName(value)}
              placeholderTextColor="#ADADAF"
              placeholder="Ej. History"
              enablesReturnKeyAutomatically
              onSubmitEditing={() => addCourserefBottomModal.current.close()}
              // onEndEditing={() => addCourserefBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <FlatList
              data={courseColors}
              keyExtractor={item => item.color1}
              horizontal
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) =>
                item.position === selectedColorPosition ? (
                  <Button
                    onPress={() => {
                      setSelectedColorPosition(item.position);
                    }}
                    content={
                      <LinearGradient
                        colors={[item.color1, item.color2]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.text,
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
                      setSelectedColorPosition(item.position);
                    }}
                    content={
                      <LinearGradient
                        colors={[item.color1, item.color2]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={{
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 2.5,
                          borderColor: colors.background,
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
            <FlatList
              data={icons}
              keyExtractor={item => item.iconCode}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              renderItem={({item}) =>
                item.iconCode === selectedIcon ? (
                  <Button
                    onPress={() => setSelectedIcon(item.iconCode)}
                    content={
                      <View
                        style={{
                          alignItems: 'center',
                        }}>
                        <MaterialCommunityIcons
                          name={item.iconCode}
                          size={30}
                          color={colors.text}
                        />
                      </View>
                    }
                    styleBtn={{
                      backgroundColor: colors.forms,
                      marginHorizontal: 10,
                      padding: 5,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <Button
                    onPress={() => setSelectedIcon(item.iconCode)}
                    content={
                      <View
                        style={{
                          alignItems: 'center',
                        }}>
                        <MaterialCommunityIcons
                          name={item.iconCode}
                          size={30}
                          color={colors.text}
                        />
                      </View>
                    }
                    styleBtn={{
                      marginHorizontal: 10,
                      padding: 5,
                      borderRadius: 8,
                    }}
                  />
                )
              }
            />
            <View
              style={{
                flexDirection: 'row',
                alignSelf: editCourse ? null : 'flex-end',
                justifyContent: editCourse ? 'space-between' : null,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: null,
              }}>
              {editCourse ? (
                <Button
                  onPress={() =>
                    showAlert(
                      'Eiminar Curso',
                      '¿Eliminar permanentemente curso y su contenido?',
                      () => {
                        console.log('cancelado');
                      },
                      () => {
                        console.log('eliminado');
                        handleDeleteTask();
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
                  courseName.length > 0
                    ? editCourse
                      ? hanldeEditAndSaveCourse(
                          courseName,
                          selectedColorPosition,
                          selectedIcon,
                        )
                      : handleCreateAndSeveNewCouse(
                          courseName,
                          selectedColorPosition,
                          selectedIcon,
                        )
                    : Alert.alert('Introduce nombre')
                }
                content={
                  editCourse ? (
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

  return (
    <>
      {userCourses.length > 0 ? (
        <View style={{width: '100%', height: '48%', backgroundColor: null}}>
          <FlatList
            data={userCourses}
            keyExtractor={item => item._id}
            numColumns={2}
            style={{backgroundColor: null}}
            renderItem={({item}) => (
              <Button
                onPress={() =>
                  navigation.navigate(screen, {
                    courseTitle: item.name,
                    color: item.color,
                    courseId:  String(ObjectId(item._id)),
                    // courseNotificationsArr: item.notificationsStudy,
                    // courseFlashCardsArr: item.flashCards,
                  })
                }
                longPress={() => {
                  setEditCourse(true);
                  setCourseId(item._id);
                  setCouseName(item.name);
                  setSelectedColorPosition(Number(item.color));
                  setSelectedIcon(item.icon);
                  addCourserefBottomModal.current.open();
                }}
                content={
                  <LinearGradient
                    start={{x: 0.0, y: 0.25}}
                    end={{x: 0.5, y: 1.0}}
                    colors={[
                      courseColors[item.color].color1,
                      courseColors[item.color].color2,
                    ]}
                    style={{borderRadius: 20}}>
                    <View
                      style={{
                        alignItems: 'center',
                        height: 140,
                        justifyContent: 'center',
                      }}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={40}
                        color="white"
                      />
                      <Text
                        style={{fontSize: 16, color: 'white', marginTop: 2}}>
                        {item.name}
                      </Text>
                    </View>
                  </LinearGradient>
                }
                styleBtn={styles.button_course_container}
              />
            )}
          />
          <View
            style={styles.bottom_button}>
            <AddButton
              onPress={() => {
                setEditCourse(false);
                setCouseName('');
                setSelectedColorPosition(0);
                setSelectedIcon('bus');
                addCourserefBottomModal.current.open();
              }}
              iconSize={60}
            />
          </View>
        </View>
      ) : (
        <View style={styles.bottomContainer}>
          <Text style={{marginBottom: 15, fontSize: 20}}>Add Course</Text>
          <AddButton
            onPress={() => {
              setEditCourse(false);
              setCouseName('');
              setSelectedColorPosition(0);
              setSelectedIcon('bus');
              addCourserefBottomModal.current.open();
            }}
            iconSize={60}
          />
        </View>
      )}
      {addCourseModal()}
    </>
  );
};

let button_course_container_size;
let button_course_container_marginLeft;
let button_course_container_marginVertical;

let bottom_button_top;
let bottom_button_left;

if (size === 'small') {
} else if (size === 'medium') {
  button_course_container_size = 183;
  button_course_container_marginLeft = 8;
  button_course_container_marginVertical = 8;

  bottom_button_top = '75%';
  bottom_button_left = '82%';
} else {
  //large screen
  button_course_container_size = 195;
  button_course_container_marginLeft = 8;
  button_course_container_marginVertical = 8;

  bottom_button_top = '58%';
  bottom_button_left = '82%';
}

const styles = StyleSheet.create({
  button_course_container: {
    width: button_course_container_size,
    marginLeft: button_course_container_marginLeft,
    marginVertical: button_course_container_marginVertical,
  },
  bottom_button: {
    position: 'absolute',
    alignItems: 'flex-end',
    top: bottom_button_top,
    left: bottom_button_left
  },
  bottomContainer: {
    backgroundColor: null,
    width: '100%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CoursesList;
