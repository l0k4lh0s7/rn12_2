import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import Button from '../../../components/Button';

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

import {Typography} from '../../../styles';

const UserRoutinesProfile = ({route}) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const {userName, userImgProfile, userFirstName, userLastName, userStudy} =
    route.params;
  return (
    <SafeAreaView>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Button
          onPress={() => {
            navigation.goBack();
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
        <View
          style={{
            // backgroundColor: 'lightgreen',
            width: '82%',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20}}>
            {userFirstName}
          </Text>
        </View>
      </View>
      <ScrollView>
        <View
          style={{
            backgroundColor: 'lightblue',
            alignItems: 'center',
            // height: '100%',
          }}>
          <View
            style={{
              width: 120,
              height: 120,
              backgroundColor: userImgProfile,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginTop: 50,
              marginBottom: 30
            }}>
            <Text>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View
            style={{
              backgroundColor: 'red',
              alignItems: 'center',
              height: 55,
              justifyContent: 'space-between',
            }}>
            {/* <Text>{userFirstName}</Text> */}
            <Text style={{fontSize: 17}}>
              @{userName}
            </Text>
            <Text style={{fontSize: 20}}>
              I Study: {userStudy}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserRoutinesProfile;
