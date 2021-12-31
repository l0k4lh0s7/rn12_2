/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  DrawerItem,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import RealmContext from '../../contexts/RealmContext';

import {ObjectId} from 'bson';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {useTheme, useNavigation} from '@react-navigation/native';

import Button from '../../components/Button';
import AddButton from '../../components/AddButton';
import {IconsSwitchSelector} from '../../components/SwitchSelector/CustomSwitchSelector';
import SubmitButtons from '../../components/BottomModal/submitButtons';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import I18n from '../../services/translation';
import {getRealm} from '../../services/realm';

import Dialog from 'react-native-dialog';
import Modal from 'react-native-modal';

import {responsive, showAlert, icons} from '../../utils';

const size = responsive();

export function CustomDrawerContent(props) {
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const {colors} = useTheme();
  const navigation = useNavigation();

  const [filters, setFilters] = useState('');

  const [filterNameTextInput, setFilterNameTextInput] = useState('');

  const [filterName, setfilterName] = useState('');
  const [filterIcon, setfilterIcon] = useState('access-time');

  const [dialogVisible, setDialogVisible] = useState(false);

  const [isMenuModalVisible, setMenuModalVisible] = useState(false);

  useEffect(() => {
    const handleGetUsersFilters = async () => {
      const foundFilters = realm.objects('Filter');

      setFilters(foundFilters);
    };
    handleGetUsersFilters();
  }, []);

  const showDialog = () => {
    setDialogVisible(true);
  };

  const handleCancel = () => {
    setDialogVisible(false);
  };

  const handleCreateAndSaveNewFilter = async (name, icon) => {
    const data = {
      _id: ObjectId(),
      name: name,
      icon: icon,
      userID: realmApp.currentUser ? realmApp.currentUser.id : 'unknownUser',
    };

    try {
      realm.write(() => {
        realm.create('Filter', data);
      });
    } catch (error) {
      console.log('ERR', error);
    }

    setFilters(realm.objects('Filter'));
    handleCancel();
    setMenuModalVisible(false);
  };

  const hanleDeleteFilter = async filterId => {
    try {
      realm.write(() => {
        const foundFilter = realm.objectForPrimaryKey('Filter', ObjectId(filterId));

        realm.delete(foundFilter);
      });
    } catch (error) {
      console.log('ERR', error);
    }

    setFilters(realm.objects('Filter'));
  };

  let drawerTitleFontSize;
  let newRoutineTextSize;
  let newRoutineIconSize;

  if (size === 'small') {
    drawerTitleFontSize = 12;
    newRoutineTextSize = 11;
    newRoutineIconSize = 15;
  } else if (size === 'medium') {
    drawerTitleFontSize = 14;
    newRoutineTextSize = 13;
    newRoutineIconSize = 17;
  } else {
    drawerTitleFontSize = 16;
    newRoutineTextSize = 15;
    newRoutineIconSize = 20;
  }

  return (
    <View {...props}>
      <View style={{alignSelf: 'center', marginTop: 60, flexDirection: 'row'}}>
        <Text style={{color: colors.text, fontSize: drawerTitleFontSize}}>
          {/* {I18n.t('yourRoutines')} */}
          Your Filters
        </Text>
        <AntDesign name="filter" color={colors.text} size={18} />
      </View>
      <AddButton
        customButton={
          <View
            style={{
              marginTop: 9,
              flexDirection: 'row',
              padding: 10,
              alignItems: 'center',
              backgroundColor: colors.forms,
            }}>
            <Text
              style={{
                color: colors.text,
                fontSize: newRoutineTextSize,
                marginRight: 5,
              }}>
              {/* {I18n.t('newRoutine')} */}
              New Filter
            </Text>
            <AntDesign
              name="pluscircleo"
              color={colors.text}
              size={newRoutineIconSize}
            />
          </View>
        }
        onPress={() => {
          // showDialog();
          setfilterName('');
          setfilterIcon('access-time')
          setMenuModalVisible(true);
          setFilterNameTextInput('');
        }}
      />
      <Modal
        isVisible={isMenuModalVisible}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={200}
        animationOutTiming={200}
        backdropTransitionInTiming={200}
        backdropTransitionOutTiming={200}
        // swipeDirection="down"
        // onSwipeComplete={() => setMenuModalVisible(false)}
        onBackdropPress={() => setMenuModalVisible(false)}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 22,
            borderRadius: 25,
            width: '100%',
            height: '43%',
          }}>
          <Text style={{textAlign: 'center'}}>New Filter</Text>
          <TextInput
            placeholderTextColor="#ADADAF"
            placeholder="Filter Name Ex: Gym"
            value={filterName}
            onChangeText={text => setfilterName(text)}
            autoFocus={false}
            style={{
              backgroundColor: '#ECECEC',
              height: 45,
              width: '100%',
              marginTop: 10,
              marginBottom: 30,
              paddingVertical: 15,
              paddingHorizontal: 25,
              borderRadius: 25,
            }}
          />
          <IconsSwitchSelector
            dataOptions={icons}
            horizontalOptions={true}
            passSelectedValue={value => setfilterIcon(value)}
          />
          <SubmitButtons
            leftButtonFunction={() => setMenuModalVisible(false)}
            leftButtonText="Cancel"
            rightButtonFunction={() => filterName.length > 0 ? handleCreateAndSaveNewFilter(filterName, filterIcon) : Alert.alert('Introduce un nombre')}
            rightButtonText="Create"
          />
        </View>
      </Modal>
      {/* <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>New Filter</Dialog.Title>
        <Dialog.Input
          autoFocus
          placeholder="Filter Name Ex; Workout"
          value={filterNameTextInput}
          onChangeText={text => setFilterNameTextInput(text)}
        />
        <Dialog.Button color="gray" label="Cancel" onPress={handleCancel} />
        <Dialog.Button
          label="Create"
          onPress={() => {
            filterNameTextInput.length === 0
              ? Alert.alert('Escribre un nombre')
              : handleCreateAndSaveNewFilter(filterNameTextInput);
          }}
        />
      </Dialog.Container> */}
      {/* <DrawerItem
        label="Rutina Ejemplo"
        inactiveTintColor={colors.text}
        inactiveBackgroundColor={colors.forms}
      />
      <DrawerItem
        label="FIN DE SEMANA"
        inactiveTintColor={colors.text}
        inactiveBackgroundColor={colors.forms}
      /> */}
      <View style={{padding: 5}}>
        <FlatList
          data={filters}
          numColumns={1}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            // <DrawerItem
            //   label={item.name}
            //   inactiveTintColor={colors.text}
            //   inactiveBackgroundColor={colors.forms}
            // />
            <Button
              customDisable={true}
              content={
                <View
                  style={{
                    // backgroundColor: 'green',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      // backgroundColor: 'red',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <MaterialCommunityIcons name={item.icon} color={colors.text} size={18} />
                    <Text style={{color: colors.text, marginLeft: 4}}>
                      {item.name}
                    </Text>
                  </View>
                  <Button
                    onPress={() =>
                      showAlert(
                        'Eiminar Filtro',
                        '¿Deseas eliminar permanentemente este Filtro?',
                        () => {
                          console.log('cancelado');
                        },
                        () => {
                          console.log('eliminado');
                          hanleDeleteFilter(item._id);
                        },
                      )
                    }
                    content={
                      <FontAwesome name="trash" color={colors.text} size={22} />
                    }
                  />
                </View>
              }
              styleBtn={{
                backgroundColor: colors.forms,
                marginVertical: 6,
                marginHorizontal: 8,
                paddingHorizontal: 9,
                paddingVertical: 13,
                borderRadius: 5,
              }}
            />
            // <TouchableOpacity
            //   onPress={() => {}}
            //   style={{
            //     backgroundColor: colors.forms,
            //     marginVertical: 6,
            //     marginHorizontal: 8,
            //     paddingHorizontal: 9,
            //     paddingVertical: 13,
            //     borderRadius: 5,
            //   }}>
            //   <Text style={{color: colors.text}}>{item.name}</Text>

            //   <Text style={{color: colors.text}}>
            //     {item.tasks.map((item2) =>
            //       handleReadableDate(item2.soundHour, item2.soundMinute),
            //     )}
            //   </Text>
            //   <Text style={{fontSize: 12, color: colors.text}}>
            //     Empieza a las
            //   </Text>
            // </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
