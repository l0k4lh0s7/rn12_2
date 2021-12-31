import React from 'react';
import {View, Text, ImageBackground, StyleSheet} from 'react-native';

import Button from '../../../components/Button';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import LinearGradient from 'react-native-linear-gradient';

import {handleReadableDate, routinesColors, responsive} from '../../../utils';

const size = responsive();

const RoutineUI = ({
  onpress,
  color_position,
  private_routine,
  name_,
  description_,
  tasks_,
  onpress_menuicon,
  routine_,
}) => {
  const truncateRoutineName = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <Button
      onPress={onpress}
      // longPress={() => {
      //   setRoutineId(item.id);
      //   setRoutineNameInput(item.name);
      //   setRoutineDescriptionInput(item.description);
      //   setPrivateRoutineSwitch(item.public);
      //   setSelectedColorPosition(Number(item.color_position));
      //   deleteOrEditRoutineBottomModal.current.open();
      // }}
      content={
        <LinearGradient
          colors={[
            routinesColors[color_position].color1,
            routinesColors[color_position].color2,
          ]}
          style={styles.routine_container}>
          <View style={styles.routine_container_content}>
            <View style={{backgroundColor: null}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: routine_ ? null : 'space-between',
                  alignItems: routine_ ? 'center' : null,
                  backgroundColor: null,
                }}>
                {routine_ ? (
                  <View
                    style={[
                      styles.routine_user_image_profile,
                      {backgroundColor: routine_.img},
                    ]}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 18,
                      }}>
                      {routine_.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                  }}>
                  {private_routine ? (
                    <SimpleLineIcons
                      name="lock"
                      color="white"
                      size={icons.private_routine}
                      style={{
                        marginRight: 3,
                      }}
                    />
                  ) : null}
                  <Text style={styles.routine_name}>{truncateRoutineName(name_, 10)}</Text>
                </View>
                {routine_ ? null : (
                  <Button
                    onPress={onpress_menuicon}
                    content={
                      <SimpleLineIcons
                        name="options-vertical"
                        color="white"
                        size={icons.routine_menu}
                      />
                    }
                  />
                )}
              </View>
              <Text style={styles.routine_description}>{truncateRoutineName(description_, 45)}</Text>
            </View>
            <View
              style={{
                // backgroundColor: 'brown',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <Text style={styles.routine_info}>Start</Text>
                <Text style={styles.routine_info}>
                  {tasks_?.length > 0
                    ? handleReadableDate(
                        tasks_
                          .filter(item => item)
                          .sort(
                            (a, b) =>
                              a.soundHour - b.soundHour ||
                              a.soundMinute - b.soundMinute,
                          )[0].soundHour,
                        tasks_
                          .filter(item => item)
                          .sort(
                            (a, b) =>
                              a.soundHour - b.soundHour ||
                              a.soundMinute - b.soundMinute,
                          )[0].soundMinute,
                      )
                    : '00:00'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <Text style={styles.routine_info}>
                  {tasks_?.length ? tasks_?.length : '0'}
                </Text>
                <Text style={styles.routine_info}>Tasks</Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <Text style={styles.routine_info}>Finish</Text>
                <Text style={styles.routine_info}>
                  {tasks_?.length > 0
                    ? handleReadableDate(
                        tasks_
                          .filter(item => item)
                          .sort(
                            (a, b) =>
                              a.soundHour - b.soundHour ||
                              a.soundMinute - b.soundMinute,
                          )[tasks_?.length - 1].soundHour,
                        tasks_
                          .filter(item => item)
                          .sort(
                            (a, b) =>
                              a.soundHour - b.soundHour ||
                              a.soundMinute - b.soundMinute,
                          )[tasks_?.length - 1].soundMinute,
                      )
                    : '00:00'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      }
      styleBtn={styles.button_routine_container}
    />
  );
};

let button_routine_container_padding_left;
let button_routine_container_padding_top;

let routine_container_content_size;
let routine_name_font_size;
let routine_description_font_size;
let routine_info_font_size;
let routine_user_image_profile_size;

let icons = {
  private_routine: 25,
  routine_menu: 25,
};

if (size === 'small') {
} else if (size === 'medium') {
  button_routine_container_padding_left = 10;
  button_routine_container_padding_top = 15;

  routine_container_content_size = 180;
  routine_name_font_size = 16;
  routine_description_font_size = 14;
  routine_info_font_size = 12;
  routine_user_image_profile_size = 45;

  icons.routine_menu = 22;
  icons.private_routine = 20;
} else {
  //large screen
  button_routine_container_padding_left = 12;
  button_routine_container_padding_top = 15;

  routine_container_content_size = 190;
  routine_name_font_size = 17;
  routine_description_font_size = 15;
  routine_info_font_size = 13;
  routine_user_image_profile_size = 50;

  icons.routine_menu = 24;
  icons.private_routine = 20;
}

const styles = StyleSheet.create({
  button_routine_container: {
    marginLeft: button_routine_container_padding_left,
    marginTop: button_routine_container_padding_top,
  },
  routine_container: {
    borderRadius: 30,
  },
  routine_container_content: {
    // flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    height: routine_container_content_size,
    width: routine_container_content_size,
    padding: 20,
  },
  routine_user_image_profile: {
    width: routine_user_image_profile_size,
    height: routine_user_image_profile_size,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
  },
  routine_name: {
    color: 'white',
    fontSize: routine_name_font_size,
  },
  routine_description: {
    color: 'white',
    fontSize: routine_description_font_size,
    marginTop: 13,
    // backgroundColor: 'red',
    width: 130,
  },
  routine_info: {
    color: 'white',
    fontSize: routine_info_font_size,
  },
});

export default RoutineUI;
