import React, { useRef, useState, useContext } from 'react';
import { View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Button from '../Button';
import RealmContext from '../../contexts/RealmContext';
import { isLoggedIn } from '../../services/realm';
import LoginModal from '../LoginModal';

const AddButton = ({iconSize, onPress, customButton}) => {
  const [loginrefBottomModal, setLoginModalRef] = useState(useRef());
  
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  

  return (
    <View>
      {customButton ? (
        <Button
          onPress={
            isLoggedIn(realmApp)
              ? onPress
              : () => loginrefBottomModal.current.open()
          }
          content={customButton}
        />
      ) : (
        <Button
          onPress={
            isLoggedIn(realmApp)
              ? onPress
              : () => loginrefBottomModal.current.open()
          }
          content={
            <AntDesign name="pluscircleo" size={iconSize} color="#BCBCBC" />
          }
        />
      )}
      <LoginModal setLoginModalRef={setLoginModalRef}/>
    </View>
  );
};

export default AddButton;
