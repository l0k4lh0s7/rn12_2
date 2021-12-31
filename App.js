/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import {useDarkMode} from 'react-native-dynamic';
import {lightTheme} from './src/themes/light';
import {darkTheme} from './src/themes/dark';

import SettingsOptionsContext from './src/contexts/SettingsOptionsContext';
import RealmContext from './src/contexts/RealmContext';

import {View, StatusBar} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {TaskDrawerScreen} from './src/screens/TasksScreen/index';
import SettingsScreen from './src/screens/SettingsScreen';
import StudyScreen from './src/screens/StudyScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';

import {getSettingsData} from './src/utils';

import {getRealmApp, getRealm} from './src/services/realm';
import SplashScreen from './src/screens/SplashScreen';

const Tabs = createBottomTabNavigator();

console.warn = (warn) => {
  const warnLen = warn.length;
  console.info(warn.slice(0, warnLen < 400 ? warnLen : 400));
}

const App = ({}) => {
  // const isDarkMode = useDarkMode();
  const [auth, setAuth] = useState(null);
  const [dark, setDark] = useState(null);
  const [issues, setIssues] = useState(null);
  const [deleteExpired, setDeleteExpired] = useState(true);
  const [soundDone, setSoundDone] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const [realmApp, setRealmApp] = useState(getRealmApp());
  const [realm, setRealm] = useState(null);

  useEffect(_ => {
    getRealm().then(newRealm => {
      setRealm(newRealm);

      setTimeout(() => {
        setShowSplashScreen(false);
      }, 3000);
    
    }).catch(err => {
      console.error('Realm Error ->', err);
    });

    getSettingsData('darkTheme', value => {
      setDark(Boolean(value));
    });

    getSettingsData('issues', value => {
      setIssues(Boolean(value));
    });

    getSettingsData('soundDone', value => {
      setSoundDone(Boolean(value));
    });
    console.log('theme cambiado');
  }, []);

  return (
    <RealmContext.Provider value={{realmApp, setRealmApp, realm, setRealm}}>
      <SettingsOptionsContext.Provider
        value={{
          deleteExpired,
          setDeleteExpired,
          soundDone,
          setSoundDone,
          issues,
          setIssues,
          dark,
          setDark,
          auth,
          setAuth,
        }}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        { showSplashScreen ? <SplashScreen theme={dark ? darkTheme : lightTheme}/> :
          <NavigationContainer theme={dark ? darkTheme : lightTheme}>
            <Tabs.Navigator>
              <Tabs.Screen
                name="tasks"
                component={TaskDrawerScreen}
                options={{
                  tabBarLabel: 'Tasks',
                  headerShown: false,

                  tabBarIcon: ({color, size}) => (
                    <FontAwesome5 name="tasks" color={color} size={25} />
                  ),
                }}
              />
              <Tabs.Screen
                name="routines"
                component={RoutinesScreen}
                options={{
                  headerShown: false,
                  tabBarLabel: 'Routines',
                  tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                      name="card-text"
                      color={color}
                      size={size}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="study"
                component={StudyScreen}
                options={{
                  headerShown: false,
                  tabBarLabel: 'Study',
                  tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                      name="lightbulb-on"
                      color={color}
                      size={size}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="settings"
                component={SettingsScreen}
                options={{
                  headerShown: false,
                  tabBarLabel: 'Settings',
                  tabBarIcon: ({color, size}) => (
                    <View>
                      {issues ? (
                        <View style={{position: 'absolute', left: 20, bottom: 9}}>
                          <MaterialIcons name="error" color="red" size={20} />
                        </View>
                      ) : null}
                      <MaterialIcons name="settings" color={color} size={size} />
                    </View>
                  ),
                }}
              />
            </Tabs.Navigator>
          </NavigationContainer>
        }
      </SettingsOptionsContext.Provider>
    </RealmContext.Provider>
  );
};

export default App;
