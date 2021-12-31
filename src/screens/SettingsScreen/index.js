import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Settings, Account, TasksSettings, Support, QA, PrivacyPolicy} from './ScreensComponents';

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={Settings} />
      <SettingsStack.Screen name="Account" component={Account} />
      <SettingsStack.Screen name="Tasks Settings" component={TasksSettings} />
      <SettingsStack.Screen name="Support" component={Support} />
      <SettingsStack.Screen name="QA" component={QA} />
      <SettingsStack.Screen name="Privacy Policy" component={PrivacyPolicy} />
    </SettingsStack.Navigator>
  );
};

export default SettingsStackScreen;
