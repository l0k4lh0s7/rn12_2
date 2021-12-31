/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  AppState,
  ScrollView,
  Switch,
  Linking,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  FlatList,
} from 'react-native';

//¡¡TODOOOO!!!! REFACTORIZAR FUNCIONES Y COMPONENTES FUNCIONALES EN SUS PROPIOS ARCHIVOS Y ASI CON GO ETC
import I18n from '../../../services/translation';

import {checkNotifications, openSettings} from 'react-native-permissions';

import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-community/masked-view';

import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '@react-navigation/native';

import axios from 'axios';

import Button from '../../../components/Button';
import BottomModal from '../../../components/BottomModal';
import SettingsContainer from '../../../components/SettingsContainer';
import Input from '../../../components/Input';

import SettingsOptionsContext from '../../../contexts/SettingsOptionsContext';
import RealmContext from '../../../contexts/RealmContext';
import { getRealmApp, isLoggedIn } from '../../../services/realm';

import {
  storeSettingsData,
  getSettingsData,
  removeSettingsData,
  getSettingsEncryptedData,
  storeSettingsEncryptedData,
  showAyncStorageData,
} from '../../../utils';

import LoginModal from '../../../components/LoginModal';

// import PushNotification from 'react-native-push-notification';

const SettingsContent = ({navigation}) => {
  const {colors} = useTheme();
  const {realmApp, setRealmApp} = useContext(RealmContext);

  const [notifications, setNotifications] = useState(null);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [reload, setReload] = useState(false);

  const _handleAppStateChange = nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      setReload(true);
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log('AppState', appState.current);
    setReload(false);
  };

  const [loginrefBottomModal, setLoginModalRef] = useState(useRef());

  const {issues, setIssues, dark, setDark} = useContext(
    SettingsOptionsContext,
  );

  const [switchTheme, setSwitchTheme] = useState(null);

  useEffect(() => {
    getSettingsData('darkTheme', value => {
      console.log('el dark', value);
      if (value === 'true') {
        setSwitchTheme(true);
        setDark(true);
      } else {
        setSwitchTheme(false);
        setDark(false);
      }
    });
  }, [dark, setDark]);

  useEffect(() => {
    checkNotifications().then(({status, settings}) => {
      if (status === 'granted') {
        setNotifications(true);
      } else {
        setNotifications(false);
      }
    });
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
      // AppState.addEventListener('change', _handleAppStateChange);

    };
  }, [reload, issues, setIssues]);

  useEffect(() => {
    const handleIssues = () => {
      if (
        notifications && isLoggedIn(realmApp)
      ) {
        setIssues(false);
        removeSettingsData('issues'); //esto para el async de notis
      } else {
        setIssues(true);
        storeSettingsData('issues', 'true');
      }
    };
    handleIssues();
  }, [notifications, setIssues]);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{alignItems: 'center'}}>
        <SettingsContainer
          leftContent={<AntDesign name="user" color={colors.text} size={20} />}
          mainContent={
            isLoggedIn(realmApp) ? (
              <Text style={{color: colors.text}}>My Account</Text>
            ) : (
              <Text style={{color: colors.text}}>{I18n.t('login')}</Text>
            )
          }
          rightContent={
            isLoggedIn(realmApp) ? (
              <Entypo
                name="chevron-small-right"
                color={colors.text}
                size={20}
              />
            ) : (
              <MaterialIcons name="error" color="red" size={20} />
            )
          }
          onPress={() => {
            if (
              isLoggedIn(realmApp)
            ) {
              navigation.navigate('Account');
            } else {
              loginrefBottomModal.current.open();
            }
          }}
        />

        <LoginModal setLoginModalRef={setLoginModalRef} />

        {/* <SettingsContainer
          leftContent={
            <MaterialIcons name="bar-chart" color={colors.text} size={20} />
          }
          mainContent={<Text style={{color: colors.text}}>Your Advance</Text>}
          rightContent={
            <Entypo name="chevron-small-right" color={colors.text} size={20} />
          }
          onPress={() => Alert.alert('advance')}
        /> */}

        <SettingsContainer
          mainContent={
            notifications ? (
              <Text style={{color: colors.text}}>Notifications settings</Text>
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: colors.text}}>Activate Notifications</Text>
                <MaterialIcons name="error" color="red" size={20} />
              </View>
            )
          }
          rightContent={
            notifications ? (
              <Entypo
                name="chevron-small-right"
                color={colors.text}
                size={20}
              />
            ) : (
              <FontAwesome name="external-link" color={colors.text} size={18} />
            )
          }
          onPress={() =>
            notifications ? Alert.alert('settings') : openSettings()
          }
        />

        <SettingsContainer
          mainContent={<Text style={{color: colors.text}}>Dark Theme</Text>}
          rightContent={
            <Switch
              value={switchTheme}
              onValueChange={value => {
                setDark(!dark);
                value
                  ? storeSettingsData('darkTheme', 'true')
                  : removeSettingsData('darkTheme');
              }}
            />
          }
          disablePress={true}
        />

        <SettingsContainer
          mainContent={<Text style={{color: colors.text}}>Tasks Settings</Text>}
          rightContent={
            <Entypo name="chevron-small-right" color={colors.text} size={20} />
          }
          onPress={() => navigation.navigate('Tasks Settings')}
        />

        <SettingsContainer
          leftContent={<FontAwesome name="star" color="orange" size={18} />}
          mainContent={
            Platform.OS === 'ios' ? (
              <Text style={{color: 'green'}}>Rate us On App Store</Text>
            ) : (
              <Text style={{color: colors.text}}>Rate us On PlayStore</Text>
            )
          }
          rightContent={
            <FontAwesome name="external-link" color={colors.text} size={18} />
          }
          onPress={() =>
            Linking.openURL('https://reactnative.dev/docs/linking')
          }
          settingsGroup={true}
          borderRadiusTop={10}
          customMargin={true}
          marginTop={20}
          marginBottom={0}
        />

        <SettingsContainer
          leftContent={
            <FontAwesome name="instagram" color={colors.text} size={20} />
          }
          mainContent={<Text style={{color: colors.text}}>Instagram</Text>}
          rightContent={
            <FontAwesome name="external-link" color={colors.text} size={18} />
          }
          onPress={() => Alert.alert('insta')}
          settingsGroup={true}
          borderRadiusBottom={10}
          customMargin={true}
          marginTop={0}
          marginBottom={20}
        />

        <SettingsContainer
          leftContent={
            <Feather
              name="mail"
              color={colors.text}
              size={20}
            />
          }
          mainContent={<Text style={{color: colors.text}}>Support - Help</Text>}
          rightContent={
            <Entypo name="chevron-small-right" color={colors.text} size={20} />
          }
          onPress={() => navigation.navigate('Support')}
        />

        <SettingsContainer
          leftContent={
            <Ionicons name="help-circle-outline" color={colors.text} size={20} />
          }
          mainContent={
            <Text style={{color: colors.text}}>Questions and Answers</Text>
          }
          rightContent={
            <Entypo name="chevron-small-right" color={colors.text} size={20} />
          }
          onPress={() => navigation.navigate('QA')}
        />

        <SettingsContainer
          leftContent={
            <Ionicons name="shield-checkmark-outline" color={colors.text} size={20} />
          }
          mainContent={<Text style={{color: colors.text}}>Privacy</Text>}
          rightContent={
            <Entypo name="chevron-small-right" color={colors.text} size={20} />
          }
          onPress={() => navigation.navigate('Privacy Policy')}
        />
        {/*
        {(
      realmApp.currentUser !== undefined &&
      realmApp.currentUser !== null &&
      realmApp.currentUser.isLoggedIn
    ) ? (
          <SettingsContainer
            leftContent={
              <Entypo name="log-out" color={colors.text} size={18} />
            }
            mainContent={
              (
      realmApp.currentUser !== undefined &&
      realmApp.currentUser !== null &&
      realmApp.currentUser.isLoggedIn
    ) ? (
                authLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={{color: colors.text}}>Log Out</Text> OR HERE
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
        ) : null} */}
      </View>
    </ScrollView>
  );
};

export default SettingsContent;
