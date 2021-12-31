import React, {useRef} from 'react';

import {View, Text, TouchableOpacity} from 'react-native';

import BottomModal from './index';
import Button from '../Button';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {useTheme} from '@react-navigation/native';

const DeleteOrEdit = ({customRef, edit, item, onPressDelete, onPressEdit, pressedEdit}) => {
  const {colors} = useTheme();

  const deleteOrEditRef = useRef();

  return (
    <BottomModal
      openModal={customRef}
      wrapperColor={colors.modalWrapper}
      muchContent={false}
      borderRadiusTop={40}
      closeDragDown={true}
      content={
        <View
          style={
            {
              // backgroundColor: 'yellow',
            }
          }>
          <Button
            onPress={onPressDelete}
            content={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  // backgroundColor: 'pink',
                }}>
                <View
                  style={{
                    backgroundColor: colors.forms,
                    marginRight: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 13,
                    borderRadius: 13,
                  }}>
                  <FontAwesome
                    name="trash"
                    color={colors.text}
                    size={30}
                    style={{}}
                  />
                </View>
                <Text style={{fontSize: 16, color: colors.text}}>
                  Delete {item}
                </Text>
              </View>
            }
            styleBtn={{
              paddingHorizontal: 25,
              paddingVertical: 15,
              // backgroundColor: 'orange',
            }}
          />
          <Button
            onPress={onPressEdit}
            content={
              <TouchableOpacity onPress={() => pressedEdit(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  // backgroundColor: 'pink',
                }}>
                <View
                  style={{
                    backgroundColor: colors.forms,
                    marginRight: 15,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderRadius: 13,
                  }}>
                  <MaterialCommunityIcons
                    name="circle-edit-outline"
                    color={colors.text}
                    size={30}
                    style={{}}
                  />
                </View>
                <Text style={{fontSize: 16, color: colors.text}}>
                  Edit {item}
                </Text>
                {/* {createNotificationModal()} */}
              </TouchableOpacity>
            }
            styleBtn={{
              paddingHorizontal: 25,
              paddingVertical: 15,
              // backgroundColor: 'orange',
            }}
          />
          {edit}
        </View>
      }
    />
  );
};

export default DeleteOrEdit;
