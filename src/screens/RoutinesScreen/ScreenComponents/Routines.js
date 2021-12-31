import React, {useRef, useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  FlatList,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
} from 'react-native';

import RealmContext from '../../../contexts/RealmContext';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {ObjectId} from 'bson';

import I18n from '../../../services/translation';
import {getRealm, getRealmApp, isLoggedIn} from '../../../services/realm';

import Button from '../../../components/Button';
import AddButton from '../../../components/AddButton';
import BottomModal from '../../../components/BottomModal';
import RoutineUI from '../RoutineUI';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import LinearGradient from 'react-native-linear-gradient';

import {useTheme, useNavigation} from '@react-navigation/native';

// import {Typography} from '../../../styles';

import {
  handleReadableDate,
  routinesColors,
  showAlert,
  responsive,
  getSettingsEncryptedData,
  showAyncStorageData,
} from '../../../utils';

const size = responsive();

const Routines = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [userRoutines, setUserRoutines] = useState([]);

  const [routineId, setRoutineId] = useState('');
  const [routineNameInput, setRoutineNameInput] = useState('');
  const [routineDescriptionInput, setRoutineDescriptionInput] = useState('');
  const [selectedColorPosition, setSelectedColorPosition] = useState(0);
  const [privateRoutineSwitch, setPrivateRoutineSwitch] = useState(false);

  const [editRoutine, setEditRoutine] = useState(false);

  const inputredBottomModal = useRef();
  const editRoutineBottomModal = useRef();
  const deleteOrEditRoutineBottomModal = useRef();

  const handleCreateAndSeveNewRoutine = async (
    name,
    des,
    color,
    publicRoutine,
  ) => {
    const data = {
      _id: ObjectId(),
      name: name,
      description: des,
      colorPosition: color,
      private: publicRoutine,
      userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
      creator: {
        id: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
        name: realmApp.currentUser
          ? realmApp.currentUser.customData.name
          : 'unknownUser',
        img: realmApp.currentUser
          ? realmApp.currentUser.customData.userProfileImg
          : 'unknownUser',
      },
    };

    // const realm = await getRealm();

    try {
      realm.write(() => {
        realm.create('Routine', data);
      });
    } catch (error) {
      console.log('ERR', error);
    }

    setUserRoutines(realm.objects('Routine'));

    inputredBottomModal.current.close();
  };

  const hanldeEditAndSaveRoutine = async () => {
    try {
      realm.write(() => {
        const foundRoutine = realm.objectForPrimaryKey('Routine', routineId);

        foundRoutine.name = routineNameInput;
        foundRoutine.description = routineDescriptionInput;
        foundRoutine.colorPosition = selectedColorPosition;
        foundRoutine.private = privateRoutineSwitch;
      });
    } catch (error) {
      console.log('ERR', error);
    }

    setUserRoutines(realm.objects('Routine'));

    editRoutineBottomModal.current.close();
  };

  const handleDeleteRoutine = async () => {
    try {
      realm.write(() => {
        const foundRoutine = realm.objectForPrimaryKey('Routine', routineId);

        realm.delete(foundRoutine);
      });
    } catch (error) {
      console.log('ERR', error);
    }

    setUserRoutines(realm.objects('Routine'));

    deleteOrEditRoutineBottomModal.current.close();
  };

  const newRoutineModalKeyBoard = () => {
    return (
      <BottomModal
        openModal={inputredBottomModal}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={215}
        borderRadiusTop={10}
        closeDragDown={false}
        content={
          <View>
            <TextInput
              autoFocus
              value={routineNameInput}
              onChangeText={value => setRoutineNameInput(value)}
              placeholderTextColor="#ADADAF"
              placeholder="Routine Name Ex; For the Weekends"
              enablesReturnKeyAutomatically
              onSubmitEditing={() => inputredBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <TextInput
              autoFocus
              value={routineDescriptionInput}
              onChangeText={value => setRoutineDescriptionInput(value)}
              placeholderTextColor="#ADADAF"
              placeholder="Routine Description Ex; This Routine is when weekends.."
              enablesReturnKeyAutomatically
              onSubmitEditing={() => inputredBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <FlatList
              data={routinesColors}
              keyExtractor={item => item.position}
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
            <View
              style={{
                flexDirection: 'row',
                // alignSelf: editRoutine ? null : 'flex-end',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: null,
              }}>
              {editRoutine ? (
                <Button
                  onPress={() =>
                    showAlert(
                      'Eiminar Rutina',
                      '¿Deseas eliminar permanentemente tu Rutina y su contenido?',
                      () => {
                        console.log('cancelado');
                      },
                      () => {
                        console.log('eliminado');
                        handleDeleteRoutine();
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '44%',
                  justifyContent: 'space-between',
                }}>
                <Text>Private Routine</Text>
                <Switch
                  value={privateRoutineSwitch}
                  onValueChange={() =>
                    setPrivateRoutineSwitch(!privateRoutineSwitch)
                  }
                />
              </View>
              <Button
                onPress={() =>
                  routineNameInput.length > 0
                    ? editRoutine
                      ? hanldeEditAndSaveRoutine(
                          routineNameInput,
                          routineDescriptionInput,
                          selectedColorPosition,
                          privateRoutineSwitch,
                        )
                      : handleCreateAndSeveNewRoutine(
                          routineNameInput,
                          routineDescriptionInput,
                          selectedColorPosition,
                          privateRoutineSwitch,
                        )
                    : Alert.alert('Introduce nombre')
                }
                content={
                  editRoutine ? (
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

  const editRoutineModalKeyBoard = () => {
    return (
      <BottomModal
        openModal={editRoutineBottomModal}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={215}
        borderRadiusTop={10}
        closeDragDown={false}
        content={
          <View>
            <TextInput
              autoFocus
              value={routineNameInput}
              onChangeText={value => setRoutineNameInput(value)}
              placeholderTextColor="#ADADAF"
              placeholder="Routine Name Ex; For the Weekends"
              enablesReturnKeyAutomatically
              onSubmitEditing={() => editRoutineBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <TextInput
              autoFocus
              value={routineDescriptionInput}
              onChangeText={value => setRoutineDescriptionInput(value)}
              placeholderTextColor="#ADADAF"
              placeholder="Routine Description Ex; This Routine is when weekends.."
              enablesReturnKeyAutomatically
              onSubmitEditing={() => editRoutineBottomModal.current.close()}
              style={{
                backgroundColor: null,
                paddingHorizontal: 25,
                paddingVertical: 20,
                color: colors.text,
              }}
            />
            <FlatList
              data={routinesColors}
              keyExtractor={item => item.position}
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
            <View
              style={{
                flexDirection: 'row',
                // alignSelf: editRoutine ? null : 'flex-end',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: null,
              }}>
              {/* {editRoutine ? (
                <Button
                  onPress={() =>
                    showAlert(
                      'Eiminar Rutina',
                      '¿Deseas eliminar permanentemente tu Rutina y su contenido?',
                      () => {
                        console.log('cancelado');
                      },
                      () => {
                        console.log('eliminado');
                        handleDeleteRoutine();
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
              ) : null} */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '40%',
                  justifyContent: 'space-between',
                }}>
                <Text>Private Routine</Text>
                <Switch
                  value={privateRoutineSwitch}
                  onValueChange={() =>
                    setPrivateRoutineSwitch(!privateRoutineSwitch)
                  }
                />
              </View>
              <Button
                onPress={() =>
                  routineNameInput.length > 0
                    ? hanldeEditAndSaveRoutine()
                    : Alert.alert('Introduce nombre')
                }
                content={
                  <MaterialCommunityIcons
                    name="circle-edit-outline"
                    size={34}
                    color="lightblue"
                  />
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
        openModal={deleteOrEditRoutineBottomModal}
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
                setEditRoutine(false);
                showAlert(
                  'Eiminar Rutina',
                  '¿Deseas eliminar permanentemente tu Rutina y su contenido?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteRoutine();
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
                    Delete Routine
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
                setEditRoutine(true);
                editRoutineBottomModal.current.open();
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
                    Edit Routine
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
            {editRoutineModalKeyBoard()}
          </View>
        }
      />
    );
  };

  useEffect(() => {
    const handleGetRoutines = async () => {
      const routines = realm.objects('Routine');

      setUserRoutines(routines);
    };
    navigation.addListener('focus', () => {
      console.log('ENFOCADO');
      handleGetRoutines();
    });
  }, []);

  return (
    <>
        <View
          style={{
            // backgroundColor: 'red',
            // padding: 8,
            // paddingTop: 35,
            height: '100%',
            alignItems: 'center',
          }}>
          <Button
            onPress={() => navigation.navigate('Community')}
            styleBtn={{
              width: '100%',
              height: 120,
              // borderRadius: 25,
              backgroundColor: 'blue',
              // padding: 25,
            }}
            content={
              <ImageBackground
                resizeMode="stretch"
                source={require('../../../../assets/images/brandBG.png')}
                style={{
                  width: '100%',
                  height: '100%',
                }}>
                <View
                  style={{
                    padding: 25,
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'white',
                    }}>
                    Discover and use the routines of students around the world
                  </Text>
                </View>
              </ImageBackground>
            }
          />
          {userRoutines.length > 0 ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                // backgroundColor: 'green',
                // paddingBottom: '5%',
              }}>
              <View
                style={{
                  // backgroundColor: 'orange',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                }}>
                <Text
                  style={{
                    // fontFamily: Typography.RoutineProperties,
                    fontSize: 20,
                  }}>
                  Your Routines
                </Text>
                <AddButton
                  onPress={() => {
                    setEditRoutine(false);
                    setRoutineNameInput('');
                    setRoutineDescriptionInput('');
                    setPrivateRoutineSwitch(false);
                    setSelectedColorPosition(0);
                    inputredBottomModal.current.open();
                  }}
                  iconSize={40}
                />
              </View>
              <FlatList
                data={userRoutines}
                keyExtractor={item => item._id}
                numColumns={2}
                scrollEnabled={true}
                style={
                  {
                    // backgroundColor: 'gray',
                    // height: '100%',
                    // paddingBottom: '25%',
                  }
                }
                renderItem={({item}) => (
                  <RoutineUI
                    onpress={() =>
                      navigation.navigate('RoutineId', {
                        routineName: item.name,
                        routineDescription: item.description,
                        color_position: item.colorPosition,
                        idRoutine: item.id,
                        otherUserRoutine: false,
                        userCreatorImgProfile: item.creator.img,
                        userCreatorUserName: item.creator.name,
                        routineTasks: item.tasks,
                        routine: item,
                      })
                    }
                    color_position={item.colorPosition}
                    private_routine={item.private}
                    name_={item.name}
                    description_={item.description}
                    tasks_={item.tasks}
                    onpress_menuicon={() => {
                      setRoutineId(item._id);
                      setRoutineNameInput(item.name);
                      setRoutineDescriptionInput(item.description);
                      console.log(item.private);
                      setPrivateRoutineSwitch(item.private);
                      setSelectedColorPosition(Number(item.colorPosition));
                      deleteOrEditRoutineBottomModal.current.open();
                    }}
                  />
                )}
              />
            </View>
          ) : (
            <View
              style={{
                backgroundColor: 'green',
                padding: 11,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text>Add Routine</Text>
              <AddButton
                onPress={() => {
                  setEditRoutine(false);
                  setRoutineNameInput('');
                  setRoutineDescriptionInput('');
                  setPrivateRoutineSwitch(false);
                  setSelectedColorPosition(0);
                  inputredBottomModal.current.open();
                }}
                iconSize={64}
              />
            </View>
          )}
        </View>
      {deleteOrEditRoutineModal()}
      {newRoutineModalKeyBoard()}
    </>
  );
};

export default Routines;
