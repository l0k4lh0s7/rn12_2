import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  FlatList,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import RealmContext from '../../../contexts/RealmContext';

import Button from '../../../components/Button';
import RoutineUI from '../RoutineUI';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import LinearGradient from 'react-native-linear-gradient';

import {useTheme, useNavigation} from '@react-navigation/native';

import {
  courseColors,
  showAlert,
  responsive,
  routinesColors,
} from '../../../utils';

const RoutinesCommunity = () => {
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const {colors} = useTheme();
  const navigation = useNavigation();

  const [userPressTextInput, setUserPressTextInput] = useState(false);
  const [userSearchTextInput, setUserSearchTextInput] = useState('');

  const [search, setSearch] = useState('');

  const [allUsersPublicRoutines, setAllUsersPublicRoutines] = useState([]);
  const [usersName, setUsersName] = useState([]);
  const [USEROVERGETTEST, setUSEROVERGETTEST] = useState(false);

  useEffect(() => {
    const getUsersTEST = async () => {
      console.log('RELM QUERY');
      try {
        const allUsersPublicRoutines_Res =
          await realmApp.currentUser.functions.getUsersPublicRoutines();
          console.log('RUTINAS___', allUsersPublicRoutines_Res.filter((item) => item.creator.id === item.userID))

        setAllUsersPublicRoutines(allUsersPublicRoutines_Res.filter((item) => item.creator.id === item.userID));

        setUsersName(allUsersPublicRoutines_Res);
      } catch (error) {
        console.log('ERROR ON GET ALL ROUTINES ', error);
      }
    };
    getUsersTEST();
  }, [USEROVERGETTEST]);

  const getUsersName = query => {
    setSearch(query);
    // setUserSearchTextInput(false);
  };

  console.log('LAS PUBLIC ROUTINES BRO:::: ', allUsersPublicRoutines);

  return (
    <SafeAreaView>
      <View
        style={{
          backgroundColor: 'lightblue',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: userPressTextInput ? 'space-evenly' : 'space-between',
          marginTop: 5,
        }}>
        {userPressTextInput ? null : (
          <Button
            onPress={() => {
              navigation.navigate('Routines');
            }}
            content={
              <Ionicons
                name="chevron-back-outline"
                size={35}
                color={colors.text}
              />
            }
            styleBtn={{
              backgroundColor: 'green',
            }}
          />
        )}
        <View
          style={{
            width: userPressTextInput ? '80%' : '90%',
          }}>
          <TextInput
            autoFocus={userPressTextInput ? true : false}
            placeholder="Search"
            value={search}
            onChangeText={value => {
              setSearch(value);
            }}
            onFocus={() => setUserPressTextInput(true)}
            style={{
              backgroundColor: colors.forms,
              paddingVertical: 0,
              paddingHorizontal: 20,
              borderRadius: 100,
              width: '99%',
              height: 45,
            }}
          />
        </View>
        {userPressTextInput ? (
          <Button
            onPress={() => {
              setUserPressTextInput(false);
              // setUserSearchTextInput('');
              setSearch('');
              Keyboard.dismiss();
            }}
            content={<Text>Cancel</Text>}
          />
        ) : null}
        {/* {searchIconPress ? (
        ) : null} */}
        {/* {searchIconPress ? null : (
          <Button
            onPress={() => setSearchIconPress(true)}
            content={
              <Entypo name="magnifying-glass" size={35} color={colors.text} />
            }
            styleBtn={{
              backgroundColor: 'red',
              marginRight: 5,
            }}
          />
        )} */}
      </View>
      {userPressTextInput ? (
        <View
          style={{
            // backgroundColor: 'green',
            height: '100%',
            alignItems: 'center',
          }}>
          <ScrollView
            style={{
              // backgroundColor: 'yellow',
              width: '100%',
            }}>
            {userPressTextInput && (
              <View
                style={{
                  // backgroundColor: 'blue',
                }}>
                {usersName
                  .filter(
                    ({creator}) =>
                      creator.name.indexOf(search.toLowerCase()) > -1,
                  )
                  .map((value, i) => {
                    return (
                      <Button
                        key={i}
                        onPress={() => {
                          navigation.navigate('UserRoutinesProfile', {
                            // routineName: item.location.street.name,
                            // routineDescription: item.location.timezone.description,
                            // color: Number(String(item.dob.age).charAt(0)),
                            // idRoutine: 'iuhy76y76f76',
                            // otherUserRoutine: true,
                            userImgProfile: value.creator.img,
                            userName: value.creator.name,
                            userFirstName: value.creator.name,
                            userLastName: value.creator.name,
                            userStudy: 'Physics',
                            // name:
                          });
                        }}
                        content={
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                width: 35,
                                height: 35,
                                backgroundColor: value.creator.img,
                                borderRadius: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}>
                              <Text style={{
                                color: 'white',
                                fontSize: 15
                              }}>
                                {value.creator.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text>{value.creator.name}</Text>
                          </View>
                        }
                        styleBtn={{
                          // backgroundColor: 'red',
                          paddingVertical: 20,
                          paddingHorizontal: 30,
                        }}
                      />
                    );
                  })}
              </View>
            )}
          </ScrollView>
          <Text>Busca personas</Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: 'lightgreen',
            height: '100%',
            paddingBottom: '20%',
          }}>
          <Button
            customDisable={true}
            // onPress={() => {}}
            styleBtn={{
              width: '100%',
              height: 100,
              backgroundColor: 'lightpink',
              padding: 25,
            }}
            content={
              <Text>
                Discover and use the routines of students around the world
              </Text>
            }
          />
          {allUsersPublicRoutines.length > 0 ? (
            <FlatList
              data={allUsersPublicRoutines}
              keyExtractor={item => item._id}
              numColumns={2}
              // scrollEnabled={true}
              refreshing={false}
              onRefresh={() => {
                console.log('iuiuh');
                setUSEROVERGETTEST(!USEROVERGETTEST);
              }}
              style={{
                backgroundColor: 'lightyellow',
                // height: '100%',
                // paddingBottom: 10,
              }}
              renderItem={({item}) => (
                <RoutineUI
                    onpress={() =>
                      navigation.navigate('RoutineId', {
                        routineName: item.name,
                        routineDescription: item.description,
                        color_position: Number(item.colorPosition),
                        idRoutine: item._id,
                        otherUserRoutine: realmApp?.currentUser.id === item.creator.id ? false : true,
                        userCreatorUserName: item.creator.name,
                        userCreatorImgProfile: item.creator.img,
                        userCreatorFirstName: item.creator.name,
                        userCreatorLastName: item.creator.name,
                        imStudy: item.creator.name,
                        routineTasks: item.tasks ? item.tasks : [],
                        routine: item,
                      })
                    }
                    routine_={item.creator}
                    color_position={item.colorPosition}
                    private_routine={item.private}
                    name_={item.name}
                    description_={item.description}
                    tasks_={item.tasks}
                  />
              )}
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  autocompleteContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 15,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 2,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default RoutinesCommunity;
