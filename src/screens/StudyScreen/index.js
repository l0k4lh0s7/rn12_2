import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  Study,
  Repetition,
  FlashCards,
  Pomodoros,
  Pomodoro,
  Exams,
  CourseNotifications,
  CourseFlashCards,
  FlashCard,
  Schedules,
  ClassSchedule,
} from './ScreensComponents';

const StudyStack = createStackNavigator();

const StudyStackScreen = () => {
  return (
    <StudyStack.Navigator>
      <StudyStack.Screen name="Study" component={Study} />
      <StudyStack.Screen name="Repetition" component={Repetition} />
      <StudyStack.Screen name="Flash Cards" component={FlashCards} />
      <StudyStack.Screen name="Exams" component={Exams} />
      <StudyStack.Screen
        name="Course Notifications"
        component={CourseNotifications}
      />
      <StudyStack.Screen
        name="Course Flash Cards"
        component={CourseFlashCards}
      />
      <StudyStack.Screen name="flashCard" component={FlashCard} />
      <StudyStack.Screen name="Pomodoros" component={Pomodoros} />
      <StudyStack.Screen
        name="Pomodoro"
        component={Pomodoro}
        options={{headerShown: false}}
      />
      <StudyStack.Screen name="schedules" component={Schedules} options={{
        headerTitle: 'Schedules'
      }} />
       <StudyStack.Screen name="classSchedules" component={ClassSchedule} options={{
        headerTitle: 'Class Schedules'
      }} />
    </StudyStack.Navigator>
  );
};

export default StudyStackScreen;
