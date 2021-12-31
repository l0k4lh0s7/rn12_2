/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';

import LinearGradient from 'react-native-linear-gradient';

import Button from '../Button';

import {responsive} from '../../utils';

const size = responsive();

const StudyModulesContainer = ({
  leftContent,
  rightContentTop,
  backgroundFigures,
  gradientColorsArray,
  onPress,
  fixed,
}) => {
  return (
    <Button
      onPress={onPress}
      customDisable={fixed}
      content={
        <LinearGradient
          start={{x: 0.0, y: 0.25}}
          end={{x: 0.5, y: 1.0}}
          colors={gradientColorsArray}
          style={{
            height: fixed ? button_module_container_height_fixed : button_module_container_height_no_fixed,
            borderRadius: 10,
          }}>
          <View
            style={{
              padding: 25,
              backgroundColor: 'transparent',
              height: '100%',
              flexDirection: 'row',
            }}>
            {backgroundFigures}
            <View style={{backgroundColor: 'transparent', width: '70%'}}>
              {leftContent}
            </View>
            <View
              style={{
                backgroundColor: 'transparent',
                width: '30%',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>{rightContentTop}</View>
              {fixed ? null : (
                <AntDesign name="arrowright" size={40} color="white" />
              )}
            </View>
          </View>
        </LinearGradient>
      }
      styleBtn={{
        width: fixed
          ? button_module_container_width_fixed
          : button_module_container_width_no_fixed,
        marginVertical: fixed
          ? button_module_container_margin_vertical_fixed
          : button_module_container_margin_vertical_no_fixed,
      }}
    />
  );
};

let button_module_container_width_fixed;
let button_module_container_width_no_fixed;

let button_module_container_height_fixed;
let button_module_container_height_no_fixed;

let button_module_container_margin_vertical_fixed;
let button_module_container_margin_vertical_no_fixed;

if (size === 'small') {
} else if (size === 'medium') {
  button_module_container_width_fixed = '97%';
  button_module_container_width_no_fixed = '93%';

  button_module_container_height_fixed = 340;
  button_module_container_height_no_fixed = 340;

  button_module_container_margin_vertical_fixed = 10;
  button_module_container_margin_vertical_no_fixed = 12;
} else {
  //large screen
  button_module_container_width_fixed = '97%';
  button_module_container_width_no_fixed = '93%';

  button_module_container_height_fixed = 340;
  button_module_container_height_no_fixed = 340;

  button_module_container_margin_vertical_fixed = 10;
  button_module_container_margin_vertical_no_fixed = 12;
}

const styles = StyleSheet.create({
  button_course_container: {},
});

export default StudyModulesContainer;
