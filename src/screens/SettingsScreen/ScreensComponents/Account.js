import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {useTheme} from '@react-navigation/native';

import jwt_decode from 'jwt-decode';

import SettingsOptionsContext from '../../../contexts/SettingsOptionsContext';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import SettingsContainer from '../../../components/SettingsContainer';
import RealmContext from '../../../contexts/RealmContext';
import {getRealm, getRealmApp, isLoggedIn} from '../../../services/realm';

import {
  removeSettingsEncryptedData,
  getSettingsEncryptedData,
} from '../../../utils';

const Account = ({navigation}) => {
  const {colors} = useTheme();
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [userName, setUserName] = useState(
    isLoggedIn(realmApp) ? realmApp.currentUser.customData ? realmApp.currentUser.customData.name : '' : '',
  );
  const [email, setEmail] = useState(
    isLoggedIn(realmApp) ? realmApp.currentUser.customData ? realmApp.currentUser.customData.email : '' : '',
  );
  const [userImgProfile, setUserImgProfile] = useState(
    isLoggedIn(realmApp) ? realmApp.currentUser.customData ? realmApp.currentUser.customData.userProfileImg : '' : '',
  );
  const [authLoading, setAuthLoading] = useState(false);

  const handleOut = () => {
    if (isLoggedIn(realmApp)) {
      setAuthLoading(true);
      realmApp.currentUser
        .logOut()
        .then(async _ => {
          if (!isLoggedIn(realmApp)) {
            setRealmApp(getRealmApp());
            setRealm(await getRealm());
            navigation.navigate('Settings');
          }
          setAuthLoading(false);
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* <View style={{
          width: 100,
          height: 100,
          backgroundColor: userImgProfile,
          borderRadius: 100,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            color: 'white',
            fontSize: 40
          }}>{userName.charAt(0).toUpperCase()}</Text>
        </View> */}
        <MaterialCommunityIcons name="account-circle-outline" size={90} color="gray" />
        <Text>¿Buscas la configuraión de tu cuenta?</Text>
        <Text>Visita el sitio web de Skool para administrar tu cuenta.</Text>
        {/* <View
          style={{
            //   backgroundColor: 'green',
            alignItems: 'center',
            width: '100%',
          }}>
          <Text
            style={{alignSelf: 'flex-start', marginLeft: 19, color: '#B0B0B0'}}>
            Name
          </Text>
          <SettingsContainer
            disablePress={false}
            textInput={true}
            inputVerticalPadding={15}
            inputHorizontalPadding={25}
            mainContent={
              <TextInput
                value={userName}
                onChangeText={value => setUserName(value)}
                style={{height: 25, backgroundColor: 'transparent'}}
              />
            }
            customMargin={true}
            marginTop={5}
            marginBottom={30}
          />
          <Text
            style={{alignSelf: 'flex-start', marginLeft: 19, color: '#B0B0B0'}}>
            Email
          </Text>
          <SettingsContainer
            disablePress={true}
            inputVerticalPadding={15}
            inputHorizontalPadding={25}
            mainContent={<Text>{email}</Text>}
            customMargin={true}
            marginTop={5}
            marginBottom={30}
          />
        </View> */}
        {/* <SettingsContainer
          leftContent={<Entypo name="log-out" color={colors.text} size={18} />}
          mainContent={<Text>Log Out</Text>}
          onPress={() => removeSettingsData('userToken')}
        /> */}
        {/* <SettingsContainer
          leftContent={
            <MaterialCommunityIcons
              name="delete-alert-outline"
              color={colors.text}
              size={20}
            />
          }
          mainContent={<Text>Delete Account</Text>}
          onPress={() => Alert.alert('you sure?')}
        /> */}
        {isLoggedIn(realmApp) ? (
          <SettingsContainer
            leftContent={
              <Entypo name="log-out" color={colors.text} size={18} />
            }
            mainContent={
              isLoggedIn(realmApp) ? (
                authLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={{color: colors.text}}>Log Out</Text> //HERE
                )
              ) : (
                <Ionicons name="checkmark-outline" color="white" size={30} />
              )
            }
            onPress={handleOut}
            customMargin={true}
            marginTop={40}
            marginBottom={15}
          />
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '100%',
    paddingVertical: 80,
  },
});

export default Account;
