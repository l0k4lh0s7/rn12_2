import React, {useState, useRef, useContext, useEffect} from 'react';
import {View, Text, TextInput, ActivityIndicator, Alert} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomModal from '../BottomModal';
import Button from '../Button';
import Input from '../Input';

import RealmContext from '../../contexts/RealmContext';
import {getRealm, getRealmApp, isLoggedIn} from '../../services/realm';
import {useTheme} from '@react-navigation/native';
import { isEmpty } from '../../utils';
import Realm from 'realm';


const LoginModal = (props) => {
  const loginrefBottomModal = useRef();
  const {colors} = useTheme();
  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);
  const [isReady, setIsReady] = useState(false);

  const signinrefBottomModal = useRef();
  const forgotPasswordefBottomModal = useRef();

  useEffect(_=> {
    if (!isReady){
      props.setLoginModalRef(loginrefBottomModal);
      setIsReady(true);
    }
  }, [loginrefBottomModal]);

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewPassword, setViewPassword] = useState(false);

  const [authError, setAuthError] = useState({
    error: false,
    errorMessage: '',
  });

  const [authLoading, setAuthLoading] = useState(false);

  const setMessage = (message, isError = false) => {
    message = !isEmpty(message) ? message.trim().charAt(0).toUpperCase() + message.slice(1) : '';
    setAuthError(prevState => ({
      ...prevState,
      error: isError,
      errorMessage: message,
    }));
  }

  const handleRegister = async (email_, password_, username_, name_) => {
    email_ = email_.toLowerCase();
    username_ = username_.toLowerCase();
    setMessage('');
    if (isEmpty(name_)) {
      setMessage('Name is required', true);
      return;
    }

    if (isEmpty(username_)) {
      setMessage('Username is required', true);
      return;
    }

    if (isEmpty(email_)) {
      setMessage('Email is required', true);
      return;
    }

    if (isEmpty(password_)) {
      setMessage('Password is required', true);
      return;
    }

    setAuthLoading(true);
    try {
      const mRealmApp = getRealmApp();
      const userData = {
        name: name_,
        username: username_,
        email: email_,
        userProfileImg: ''
      };
      const anonymousUser = await mRealmApp.logIn(Realm.Credentials.anonymous());
      const validateRes = await anonymousUser.functions['validateUserData'](userData);
      if (validateRes.status !== 'success'){
        if (anonymousUser && anonymousUser.isLoggedIn){
          await anonymousUser.logOut();
        }
        setRealmApp(getRealmApp());
        setRealm(await getRealm());
        setMessage(validateRes.message, true);
        setAuthLoading(false);
        return;
      }
      await mRealmApp.emailPasswordAuth.registerUser(email_, password_);
      const emailPasswordUserCredentials = Realm.Credentials.emailPassword(
        email_,
        password_,
      );
      const regRes = await anonymousUser.functions['addUserData'](userData);
      if (
          regRes.status === 'success' && 
          anonymousUser && anonymousUser.isLoggedIn
      ) {
        await anonymousUser.linkCredentials(emailPasswordUserCredentials);
        await anonymousUser.refreshCustomData();
        setRealmApp(getRealmApp());
        setRealm(await getRealm());
        signinrefBottomModal.current.close();
        loginrefBottomModal.current.close();
      } else {
        if (anonymousUser && anonymousUser.isLoggedIn){
         await anonymousUser.logOut(); 
        }
        setRealmApp(getRealmApp());
        setRealm(await getRealm());
        setMessage(regRes.message, true);
      }
    } catch (err) {
      const mRealmApp = getRealmApp();
      if (isLoggedIn(mRealmApp)){
        await mRealmApp.currentUser.logOut(); 
      }
      setRealmApp(getRealmApp());
      setRealm(await getRealm());
      setMessage(err.message === 'name already in use' ? 'Email is already in use' : err.message, true);
    }
    setAuthLoading(false);
  };

  const handleLogin = async (emaill, passwordd) => {
    setAuthLoading(true);
    setMessage('');
    try {
      const credentials = Realm.Credentials.emailPassword(
        emaill.toLowerCase(),
        passwordd,
      );
      const user = await realmApp.logIn(credentials);
      if (user && user.isLoggedIn) {
        setRealmApp(getRealmApp());
        setRealm(await getRealm());
        loginrefBottomModal.current.close();
      } else {
        setPassword('');
        setMessage('Failed to login', true);
      }
    } catch (err) {
      setPassword('');
      setMessage(err.message, true);
    }
    setAuthLoading(false);
  };

  const handleSendEmailToResetPassword = async email_ => {
    try {
      await realmApp.emailPasswordAuth.sendResetPasswordEmail(email_);
    } catch (err) {
      console.error('Failed to send email to reset password', err);
    }
    forgotPasswordefBottomModal.current.close();
  };

  const loginModal = () => {
    return (
      <BottomModal
        openModal={loginrefBottomModal}
        wrapperColor={colors.subModalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={840}
        borderRadiusTop={10}
        keyBoardPushContent={false}
        closeDragDown={false}
        content={
          <View style={{flexDirection: 'column'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                // backgroundColor: 'red',
                paddingRight: 15,
                marginTop: 50,
              }}>
              <AntDesign
                onPress={() => {
                  setMessage('');
                  loginrefBottomModal.current.close();
                }}
                name="close"
                color={colors.text}
                size={30}
              />
            </View>
            <View
              style={{
                // backgroundColor: 'blue',
                height: '87%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View>
                <View
                  style={{
                    marginBottom: 50,
                    // backgroundColor: 'pink',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="school" color={colors.text} size={45} />
                  <Text
                    style={{
                      fontSize: 38,
                      marginLeft: 4,
                      fontWeight: 'bold',
                      color: colors.text,
                    }}>
                    Skool
                  </Text>
                </View>

                <View>
                  <TextInput
                    value={email}
                    onChangeText={value => setEmail(value.toLowerCase())}
                    placeholder="Email"
                    placeholderTextColor="#ADADAF"
                    style={{
                      backgroundColor: colors.forms,
                      color: colors.text,
                      paddingVertical: 15,
                      paddingHorizontal: 25,
                      width: 370,
                      height: 65,
                      borderRadius: 10,
                      marginVertical: 10,
                    }}
                  />
                  <TextInput
                    value={password}
                    onChangeText={value => setPassword(value)}
                    placeholder="Password"
                    placeholderTextColor="#ADADAF"
                    secureTextEntry={!viewPassword}
                    style={{
                      backgroundColor: colors.forms,
                      color: colors.text,
                      paddingVertical: 15,
                      paddingHorizontal: 25,
                      width: 370,
                      height: 65,
                      borderRadius: 10,
                      marginVertical: 10,
                    }}
                  />
                  {viewPassword ? (
                    <Ionicons
                      name="eye-off-outline"
                      color="#ADADAF"
                      size={15}
                      style={{bottom: 50, left: 330}}
                      onPress={() => setViewPassword(!viewPassword)}
                    />
                  ) : (
                    <Ionicons
                      name="eye-outline"
                      color="#ADADAF"
                      size={15}
                      style={{bottom: 50, left: 330}}
                      onPress={() => setViewPassword(!viewPassword)}
                    />
                  )}
                  <Button
                    onPress={() => forgotPasswordefBottomModal.current.open()}
                    content={
                      <Text style={{alignSelf: 'flex-end', color: colors.text}}>
                        Forgot Password ?
                      </Text>
                    }
                  />
                  {authError.error ? (
                    <Text>{authError.errorMessage}</Text>
                  ) : null}
                  <Button
                    onPress={() => {
                      email.length && password.length > 0
                        ? handleLogin(email, password)
                        : Alert.alert(
                            'Introduce un Correo y Contraseña Validos',
                          );
                    }}
                    content={
                      isLoggedIn(realmApp) ? (
                        <Ionicons
                          name="checkmark-outline"
                          color="white"
                          size={30}
                        />
                      ) : authLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text>Log in</Text>
                      )
                    }
                    styleBtn={{
                      backgroundColor: 'lightblue',
                      alignItems: 'center',
                      alignSelf: 'center',
                      paddingVertical: 20,
                      borderRadius: 10,
                      width: '95%',
                      marginTop: 30,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      // backgroundColor: 'yellow',
                      marginTop: 40,
                    }}>
                    <Text style={{color: colors.text, marginRight: 4}}>
                      Don't have an account?
                    </Text>
                    <Button
                      onPress={() => {
                        setMessage('');
                        setPassword('');
                        signinrefBottomModal.current.open();
                      }}
                      content={<Text style={{color: 'purple'}}>Sign In</Text>}
                    />
                  </View>
                </View>
              </View>
            </View>
            {signinModal()}
            {forgotPasswordModal()}
          </View>
        }
      />
    );
  };

  const forgotPasswordModal = () => {
    return (
      <BottomModal
        openModal={forgotPasswordefBottomModal}
        wrapperColor={colors.subModalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={400}
        borderRadiusTop={10}
        keyBoardPushContent={false}
        closeDragDown={false}
        content={
          <View style={{flexDirection: 'column'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                // backgroundColor: 'red',
                padding: 15,
              }}>
              <AntDesign
                onPress={() => {
                  setMessage('');
                  forgotPasswordefBottomModal.current.close();
                }}
                name="close"
                color={colors.text}
                size={30}
              />
            </View>
            <View
              style={{
                // backgroundColor: 'blue',
                height: '80%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    marginLeft: 4,
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: 35,
                  }}>
                  Your email to reset password
                </Text>
                <View>
                  <TextInput
                    value={email}
                    onChangeText={value => setEmail(value.toLowerCase())}
                    placeholder="Email"
                    placeholderTextColor="#ADADAF"
                    style={{
                      backgroundColor: colors.forms,
                      color: colors.text,
                      paddingVertical: 15,
                      paddingHorizontal: 25,
                      width: 370,
                      height: 65,
                      borderRadius: 10,
                      marginVertical: 10,
                    }}
                  />

                  <Button
                    onPress={() => {
                      email.length > 0
                        ? handleSendEmailToResetPassword(email)
                        : Alert.alert(
                            'Introduce un Correo para enviar el mail',
                          );
                    }}
                    content={
                        isLoggedIn(realmApp) ? (
                        <Ionicons
                          name="checkmark-outline"
                          color="white"
                          size={30}
                        />
                      ) : authLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text>Send</Text>
                      )
                    }
                    styleBtn={{
                      backgroundColor: 'gray',
                      alignItems: 'center',
                      alignSelf: 'center',
                      paddingVertical: 20,
                      borderRadius: 10,
                      width: '95%',
                      marginTop: 30,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        }
      />
    );
  };

  const signinModal = () => {
    return (
      <BottomModal
        openModal={signinrefBottomModal}
        wrapperColor={colors.subModalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={840}
        borderRadiusTop={10}
        keyBoardPushContent={false}
        closeDragDown={false}
        content={
          <View style={{flexDirection: 'column'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                // backgroundColor: 'red',
                paddingRight: 15,
                marginTop: 50,
              }}>
              <AntDesign
                onPress={() => {
                  setMessage('');
                  loginrefBottomModal.current.close();
                  signinrefBottomModal.current.close();
                }}
                name="close"
                color={colors.text}
                size={30}
              />
            </View>
            <View
              style={{
                // backgroundColor: 'blue',
                height: '87%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View>
                <View
                  style={{
                    marginBottom: 50,
                    // backgroundColor: 'pink',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="school" color={colors.text} size={45} />
                  <Text
                    style={{fontSize: 38, marginLeft: 4, fontWeight: 'bold'}}>
                    Skool
                  </Text>
                </View>

                <View>
                  <Input
                    formInput={true}
                    inputValue={name}
                    inputValueOnChange={value => setName(value)}
                    placeHolder="Name"
                  />
                  <Input
                    formInput={true}
                    inputValue={email}
                    inputValueOnChange={value => setEmail(value.toLowerCase())}
                    placeHolder="Email"
                  />
                  <Input
                    formInput={true}
                    inputValue={userName}
                    inputValueOnChange={value => setUserName(value.toLowerCase())}
                    placeHolder="Username"
                  />
                  <Input
                    formInput={true}
                    inputValue={password}
                    inputValueOnChange={value => setPassword(value)}
                    placeHolder="Password"
                    customSecureTextEntry={viewPassword ? false : true}
                  />

                  {viewPassword ? (
                    <Ionicons
                      name="eye-off-outline"
                      color="gray"
                      size={15}
                      style={{bottom: 50, left: 325}}
                      onPress={() => setViewPassword(!viewPassword)}
                    />
                  ) : (
                    <Ionicons
                      name="eye-outline"
                      color="gray"
                      size={15}
                      style={{bottom: 50, left: 325}}
                      onPress={() => setViewPassword(!viewPassword)}
                    />
                  )}

                  {authError.error ? (
                    <Text>{authError.errorMessage}</Text>
                  ) : null}
                  <Button
                    onPress={() => {
                      name.length &&
                      userName.length &&
                      email.length &&
                      password.length > 0
                        ? handleRegister(email, password, userName, name)
                        : setMessage('Introduce Correo, Contraseña', true);
                    }}
                    content={
                      isLoggedIn(realmApp) ? (
                        <AntDesign name="checkcircle" color="white" size={30} />
                      ) : authLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text>Sign in</Text>
                      )
                    }
                    styleBtn={{
                      backgroundColor: 'lightblue',
                      alignItems: 'center',
                      alignSelf: 'center',
                      paddingVertical: 20,
                      borderRadius: 10,
                      width: '95%',
                      marginTop: 30,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      // backgroundColor: 'yellow',
                      marginTop: 40,
                    }}>
                    <Text style={{marginRight: 4}}>Have an account?</Text>
                    <Button
                      onPress={() => {
                          setMessage('');
                          setPassword('');
                          signinrefBottomModal.current.close();
                        }
                      }
                      content={<Text style={{color: 'purple'}}>Login</Text>}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
      />
    );
  };

  return (
    loginModal()
  );
};

export default LoginModal;
