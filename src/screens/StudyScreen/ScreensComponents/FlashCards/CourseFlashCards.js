import React, {useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import {ObjectId} from 'bson';
import Crypto from 'crypto-js';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AddButton from '../../../../components/AddButton';
import Button from '../../../../components/Button';
import BottomModal from '../../../../components/BottomModal';
import TextModal from '../../../../components/BottomModal/textModal';

import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';

import {courseColors, responsive, showAlert} from '../../../../utils';

import {useTheme} from '@react-navigation/native';

import RealmContext from '../../../../contexts/RealmContext';
import {launchImageLibrary} from 'react-native-image-picker';

const size = responsive();

const CourseFlashCards = ({route, navigation}) => {
  const {colors} = useTheme();
  const {courseTitle, color, courseId} = route.params;

  const {realmApp, setRealmApp, realm, setRealm} = useContext(RealmContext);

  const [activeLoadingScreen, setActiveLoadingScreen] = useState(false);

  const [editFlashCard, setEditFlashCard] = useState(false);

  const [flashCardId, setFlashCardId] = useState(false);

  const [courseFlashCardsArr, setCourseFlashCardsArr] = useState([]);

  const [courseFlashCards, setCourseFlashCards] = useState(false);

  const [flashCardFrontInput, setFlashCardFrontInput] = useState('');
  const [flashCardBackInput, setFlashCardBackInput] = useState('');
  const [flashCardFrontImg, setFlashCardFrontImg] = useState('');
  const [flashCardBackImg, setFlashCardBackImg] = useState('');

  const [helper_flashCardFrontImg, setHelper_FlashCardFrontImg] = useState('');
  const [helper_flashCardBackImg, setHelper_FlashCardBackImg] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: `${courseTitle} Cards`,
    });

    realm.write(() => {
      const coursefound = realm.objectForPrimaryKey(
        'Course',
        ObjectId(courseId),
      );

      setCourseFlashCardsArr(coursefound.flashCards);
    });
  }, [navigation, courseTitle, courseFlashCards]);

  const createFlashCardRef = useRef();
  const editFlashCardRef = useRef();
  const deleteOrEditFlashCardBottomModal = useRef();

  const openGallery = callback => {
    const options = {
      title: 'Select Image',
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      quality: 0,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, response => {
      console.log(response);

      if (response.errorCode) {
        Alert.alert(response.errorMessage);
      } else if (response.didCancel) {
        console.log('seleccion cancelada');
      } else {
        console.log(response.assets[0].uri);

        callback(response.assets[0]);
      }
    });
  };

  const uploadImgToCloudinary = img => {
    console.log('entro en UPLOAD IMG');
    console.log('IMG EN upload', img);
    const uri = img.uri;
    const type = img.type;
    const name = img.fileName;

    const photo = {uri, type, name};
    const ts = Math.round(new Date().getTime() / 1000);

    const apiKey = '496426191815399';
    const apiSecret = 'PB22wIWVIAN_iW3Db97-Vp2Avlo';
    const hash = `timestamp=${ts}${apiSecret}`;
    const signature = Crypto.SHA1(hash).toString();
    const url = 'https://api.cloudinary.com/v1_1/dpyjzquwi/image/upload';

    const formData = new FormData();
    formData.append('file', photo);
    formData.append('timestamp', ts);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    return fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => data)
      .catch(err => {
        console.log({err});
        Alert.alert(err);
        // setActiveLoadingScreen(false);
      });
  };

  const createFlashCardModal = () => {
    const handleCreateAndSeveNewFlashCard = async (front, back) => {
      if (flashCardFrontImg || flashCardBackImg) {
        console.log('entro en subir imagen');
        setActiveLoadingScreen(true);

        uploadImgToCloudinary(
          flashCardFrontImg !== null ? flashCardFrontImg : flashCardBackImg,
        ).then(data1 => {
          flashCardBackImg !== null
            ? uploadImgToCloudinary(flashCardBackImg).then(data2 => {
                console.log('data', data1);
                console.log('data2', data2);

                const data = {
                  id: uuidv4(),
                  name: courseTitle,
                  front: front,
                  frontImg: data1.secure_url,
                  back: back,
                  backImg: data2.secure_url,
                };

                try {
                  realm.write(() => {
                    const foundCourseToAddFlashCard = realm.objectForPrimaryKey(
                      'Course',
                      ObjectId(courseId),
                    );

                    foundCourseToAddFlashCard.flashCards.push(data);

                    setActiveLoadingScreen(false);

                    setCourseFlashCards(!courseFlashCards);
                    createFlashCardRef.current.close();
                  });
                } catch (error) {
                  console.log('ERR', error);
                }
              })
            : () => {
                const data = {
                  id: uuidv4(),
                  name: courseTitle,
                  front: front,
                  frontImg: data1.secure_url,
                  back: back,
                };

                try {
                  realm.write(() => {
                    const foundCourseToAddFlashCard = realm.objectForPrimaryKey(
                      'Course',
                      ObjectId(courseId),
                    );

                    foundCourseToAddFlashCard.flashCards.push(data);

                    setActiveLoadingScreen(false);

                    setCourseFlashCards(!courseFlashCards);
                    createFlashCardRef.current.close();
                  });
                } catch (error) {
                  console.log('ERR', error);
                }
              };
        });
      } else {
        console.log('NO entro en subir imagen');

        const data = {
          id: uuidv4(),
          name: courseTitle,
          front: front,
          back: back,
        };

        try {
          realm.write(() => {
            const foundCourseToAddFlashCard = realm.objectForPrimaryKey(
              'Course',
              ObjectId(courseId),
            );

            foundCourseToAddFlashCard.flashCards.push(data);

            setActiveLoadingScreen(false);

            setCourseFlashCards(!courseFlashCards);
            createFlashCardRef.current.close();
          });
        } catch (error) {
          console.log('ERR', error);
        }
      }
    };

    return (
      <BottomModal
        openModal={createFlashCardRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={680}
        borderRadiusTop={40}
        closeDragDown={true}
        customPaddingHorizontal={true}
        content={
          <View
            style={{
              // paddingHorizontal: 20,
              backgroundColor: null,
              height: '94%',
              justifyContent: 'space-between',
            }}>
            <View>
              <Spinner
                visible={activeLoadingScreen}
                textContent={'Loading...'}
                textStyle={{
                  color: 'white',
                }}
              />
              <TextModal text="Create new Study Card" textTitle={true} />
              <LinearGradient
                start={{x: 0.0, y: 0.25}}
                end={{x: 0.5, y: 1.0}}
                colors={[
                  courseColors[color].color1,
                  courseColors[color].color2,
                ]}
                style={{
                  marginVertical: 10,
                  backgroundColor: null,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  paddingVertical: 7,
                  paddingHorizontal: 18,
                }}>
                <Text style={{color: 'white'}}>{courseTitle}</Text>
              </LinearGradient>
              <TextModal text="Card Front" textTitle={false} />
              <TextInput
                autoFocus
                value={flashCardFrontInput}
                onChangeText={value => setFlashCardFrontInput(value)}
                placeholder="Ej. Titulo, Pregunta etc"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                //   onEndEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingVertical: 20,
                  borderRadius: 15,
                  marginVertical: 10,
                }}
              />

              <TextModal text="Front Image" textTitle={false} />
              <Button
                onPress={() =>
                  openGallery(data => {
                    console.log('data for front', data);
                    setFlashCardFrontImg(data);
                  })
                }
                content={
                  flashCardFrontImg ? (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        // resizeMode: 'cover',
                        // position: 'absolute',
                        // top: '20%',
                      }}
                      source={{
                        uri: flashCardFrontImg.uri,
                      }}
                    />
                  ) : (
                    <Text>Select Image from photo library</Text>
                  )
                }
                styleBtn={{
                  backgroundColor: colors.forms,
                  borderRadius: 9,
                  paddingHorizontal: 25,
                  paddingVertical: 13,
                  // marginBottom: 8,
                  alignItems: 'center',
                }}
              />

              <TextModal text="Card Back" textTitle={false} />
              <TextInput
                autoFocus
                value={flashCardBackInput}
                onChangeText={value => setFlashCardBackInput(value)}
                placeholder="Ej. Respuesta o significado de tu titlulo"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                // onEndEditing={() => addCourserefBottomModal.current.close()}
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingTop: 20,
                  paddingBottom: 50,
                  borderRadius: 20,
                  marginVertical: 10,
                }}
              />

              <TextModal text="Back Image" textTitle={false} />
              <Button
                onPress={() =>
                  openGallery(data => {
                    console.log('data for back', data);
                    setFlashCardBackImg(data);
                  })
                }
                content={
                  flashCardBackImg ? (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        // resizeMode: 'cover',
                        // position: 'absolute',
                        // top: '20%',
                      }}
                      source={{
                        uri: flashCardBackImg.uri,
                      }}
                    />
                  ) : (
                    <Text>Select Image from photo library</Text>
                  )
                }
                styleBtn={{
                  backgroundColor: colors.forms,
                  borderRadius: 9,
                  paddingHorizontal: 25,
                  paddingVertical: 13,
                  // marginBottom: 8,
                  alignItems: 'center',
                }}
              />
            </View>
            <View
              style={{
                backgroundColor: null,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <Button
                onPress={() => createFlashCardRef.current.close()}
                content={
                  <View
                    style={{
                      borderColor: '#3F3F3F',
                      borderWidth: 1,
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: '#3F3F3F'}}>Cancelar</Text>
                  </View>
                }
              />
              <Button
                onPress={() =>
                  flashCardFrontInput.length && flashCardBackInput.length > 0
                    ? handleCreateAndSeveNewFlashCard(
                        flashCardFrontInput,
                        flashCardBackInput,
                      )
                    : Alert.alert('debes llenar los campos')
                }
                content={
                  <View
                    style={{
                      backgroundColor: '#0B6DF6',
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: 'white'}}>Crear</Text>
                  </View>
                }
              />
            </View>
          </View>
        }
      />
    );
  };

  const editFlashCardModal = () => {
    const handleUpdateAndSaveTask = async (cardId, front, back) => {
      const foundFlashCard = courseFlashCardsArr.find(
        item => item.id === cardId,
      );

      if (helper_flashCardFrontImg || helper_flashCardBackImg) {
        console.log('entro en subir imagen');
        setActiveLoadingScreen(true);

        if (helper_flashCardFrontImg && !helper_flashCardBackImg) {
          uploadImgToCloudinary(flashCardFrontImg).then(data1 => {
            console.log('cardbackimf === null');
            try {
              realm.write(() => {
                foundFlashCard.front = front;
                foundFlashCard.back = back;
                foundFlashCard.frontImg = data1.secure_url;
                foundFlashCard.backImg = foundFlashCard.backImg;

                setActiveLoadingScreen(false);

                setCourseFlashCards(!courseFlashCards);
                editFlashCardRef.current.close();
              });
            } catch (error) {
              console.log('ERR', error);
            }
          });
        }

        if (helper_flashCardBackImg && !helper_flashCardFrontImg) {
          uploadImgToCloudinary(flashCardBackImg).then(data1 => {
            console.log('hlprbak === null');
            try {
              realm.write(() => {
                foundFlashCard.front = front;
                foundFlashCard.back = back;
                foundFlashCard.frontImg = foundFlashCard.frontImg;
                foundFlashCard.backImg = data1.secure_url;

                setActiveLoadingScreen(false);

                setCourseFlashCards(!courseFlashCards);
                editFlashCardRef.current.close();
              });
            } catch (error) {
              console.log('ERR', error);
            }
          });
        }

        if (helper_flashCardFrontImg && helper_flashCardBackImg) {
          uploadImgToCloudinary(flashCardFrontImg).then(data1 => {
            uploadImgToCloudinary(flashCardBackImg).then(data2 => {
              console.log('data', data1);
              console.log('data2', data2);
              try {
                realm.write(() => {
                  foundFlashCard.front = front;
                  foundFlashCard.back = back;
                  foundFlashCard.frontImg = data1.secure_url;
                  foundFlashCard.backImg = data2.secure_url;

                  setActiveLoadingScreen(false);

                  setCourseFlashCards(!courseFlashCards);
                  editFlashCardRef.current.close();
                });
              } catch (error) {
                console.log('ERR', error);
              }
            });
          });
        }
      } else {
        console.log('NO entro en subir imagen');

        try {
          realm.write(() => {
            foundFlashCard.front = front;
            foundFlashCard.back = back;
            setActiveLoadingScreen(false);

            setCourseFlashCards(!courseFlashCards);
            editFlashCardRef.current.close();
          });
        } catch (error) {
          console.log('ERR', error);
        }
      }
    };
    return (
      <BottomModal
        openModal={editFlashCardRef}
        keyBoardPushContent={false}
        wrapperColor={colors.modalWrapper}
        muchContent={true}
        customSize={true}
        sizeModal={680}
        borderRadiusTop={40}
        closeDragDown={true}
        content={
          <View
            style={{
              paddingHorizontal: 20,
              backgroundColor: null,
              height: '94%',
              justifyContent: 'space-between',
            }}>
            <View>
              <Spinner
                visible={activeLoadingScreen}
                textContent={'Loading...'}
                textStyle={{
                  color: 'white',
                }}
              />
              <TextModal text="Edit Study Card" textTitle={true} />
              <LinearGradient
                start={{x: 0.0, y: 0.25}}
                end={{x: 0.5, y: 1.0}}
                colors={[
                  courseColors[color].color1,
                  courseColors[color].color2,
                ]}
                style={{
                  marginVertical: 10,
                  backgroundColor: null,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  paddingVertical: 7,
                  paddingHorizontal: 18,
                }}>
                <Text style={{color: 'white'}}>{courseTitle}</Text>
              </LinearGradient>
              <TextModal text="Card Front" textTitle={false} />
              <TextInput
                autoFocus
                value={flashCardFrontInput}
                onChangeText={value => setFlashCardFrontInput(value)}
                placeholder="Ej. Titulo, Pregunta etc"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                //   onEndEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingVertical: 20,
                  borderRadius: 15,
                  marginVertical: 10,
                }}
              />

              <TextModal text="Front Image" textTitle={false} />
              <Button
                onPress={() =>
                  openGallery(data => {
                    console.log('data for front', data);
                    setFlashCardFrontImg(data);
                    setHelper_FlashCardFrontImg(data.uri);
                  })
                }
                content={
                  flashCardFrontImg ? (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        // resizeMode: 'cover',
                        // position: 'absolute',
                        // top: '20%',
                      }}
                      source={{
                        uri: helper_flashCardFrontImg
                          ? helper_flashCardFrontImg
                          : flashCardFrontImg,
                      }}
                    />
                  ) : (
                    <Text>Select Image from photo library</Text>
                  )
                }
                styleBtn={{
                  backgroundColor: colors.forms,
                  borderRadius: 9,
                  paddingHorizontal: 25,
                  paddingVertical: 13,
                  // marginBottom: 8,
                  alignItems: 'center',
                }}
              />

              <TextModal text="Card Back" textTitle={false} />
              <TextInput
                autoFocus
                value={flashCardBackInput}
                onChangeText={value => setFlashCardBackInput(value)}
                placeholder="Ej. Respuesta o significado de tu titlulo"
                //   enablesReturnKeyAutomatically
                //   onSubmitEditing={() =>
                //     createNotificationrefBottomModal.current.close()
                //   }
                // onEndEditing={() => addCourserefBottomModal.current.close()}
                style={{
                  backgroundColor: colors.forms,
                  paddingHorizontal: 25,
                  paddingTop: 20,
                  paddingBottom: 50,
                  borderRadius: 20,
                  marginVertical: 10,
                }}
              />

              <TextModal text="Back Image" textTitle={false} />
              <Button
                onPress={() =>
                  openGallery(data => {
                    console.log('data for back', data);
                    setFlashCardBackImg(data);
                    setHelper_FlashCardBackImg(data.uri);
                  })
                }
                content={
                  flashCardBackImg ? (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        // resizeMode: 'cover',
                        // position: 'absolute',
                        // top: '20%',
                      }}
                      source={{
                        uri: helper_flashCardBackImg
                          ? helper_flashCardBackImg
                          : flashCardBackImg,
                      }}
                    />
                  ) : (
                    <Text>Select Image from photo library</Text>
                  )
                }
                styleBtn={{
                  backgroundColor: colors.forms,
                  borderRadius: 9,
                  paddingHorizontal: 25,
                  paddingVertical: 13,
                  // marginBottom: 8,
                  alignItems: 'center',
                }}
              />
            </View>
            <View
              style={{
                backgroundColor: null,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <Button
                onPress={() => editFlashCardRef.current.close()}
                content={
                  <View
                    style={{
                      borderColor: '#3F3F3F',
                      borderWidth: 1,
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: '#3F3F3F'}}>Cancelar</Text>
                  </View>
                }
              />
              <Button
                onPress={() =>
                  flashCardFrontInput.length && flashCardBackInput.length > 0
                    ? handleUpdateAndSaveTask(
                        flashCardId,
                        flashCardFrontInput,
                        flashCardBackInput,
                      )
                    : Alert.alert('Nada que actualizar')
                }
                content={
                  <View
                    style={{
                      backgroundColor: '#0B3FF6',
                      paddingHorizontal: 45,
                      paddingVertical: 15,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: 'white'}}>Editar</Text>
                  </View>
                }
              />
            </View>
          </View>
        }
      />
    );
  };

  const deleteOrEditFlashCardModal = () => {
    const handleDeleteFlashCard = async cardId => {
      try {
        realm.write(() => {
          const coursefound = realm.objectForPrimaryKey(
            'Course',
            ObjectId(courseId),
          );
          console.log(
            'removed',
            coursefound.flashCards.filter(item => item.id !== cardId),
          );

          let removedFlashCard = [];
          removedFlashCard = coursefound.flashCards.filter(
            item => item.id !== cardId,
          );

          // coursefound.flashCards = [];

          console.log('REMOVEDFlashCard', removedFlashCard);

          let removedFlashCard_helper = [];

          removedFlashCard.map(item =>
            removedFlashCard_helper.push({
              id: item.id,
              name: item.name,
              front: item.front,
              frontImg: item.frontImg,
              back: item.back,
              backImg: item.backImg,
            }),
          );

          console.log('removedFlashCard_helper', removedFlashCard_helper);

          coursefound.flashCards = removedFlashCard_helper;

          // arrtest.push(coursefound.flashCards.filter((item) => item.id !== cardId))
          // console.log('arrtest', arrtest.map((item) => item))
        });
      } catch (error) {
        console.log('ERR', error);
      }

      setCourseFlashCards(!courseFlashCards);

      deleteOrEditFlashCardBottomModal.current.close();
    };

    let paddingVerticalContainer;
    let paddingHorizontalPlusIconContainer;
    let icons;
    let fontSize;
    if (size === 'small') {
      paddingVerticalContainer = 15;
      paddingHorizontalPlusIconContainer = 20;
      icons = 35;
      fontSize = 10;
    } else if (size === 'medium') {
      paddingVerticalContainer = 22;
      paddingHorizontalPlusIconContainer = 28;
      icons = 45;
      fontSize = 12;
    } else {
      //large screen
      paddingVerticalContainer = 25;
      paddingHorizontalPlusIconContainer = 30;
      icons = 48;
      fontSize = 15;
    }
    return (
      <BottomModal
        openModal={deleteOrEditFlashCardBottomModal}
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
              onPress={() => {
                setEditFlashCard(false);
                showAlert(
                  'Eiminar Notificacion',
                  '¿Deseas Eliminar permanentemente la notificacion?',
                  () => {
                    console.log('cancelado');
                  },
                  () => {
                    console.log('eliminado');
                    handleDeleteFlashCard(flashCardId);
                  },
                );
              }}
              content={
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'pink',
                  }}>
                  <FontAwesome
                    name="trash"
                    color={colors.text}
                    size={35}
                    style={{marginRight: 20}}
                  />
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Delete Flash Card
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
              onPress={() => {
                setEditFlashCard(true);
                editFlashCardRef.current.open();
              }}
              content={
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'pink',
                  }}>
                  <FontAwesome
                    name="edit"
                    color={colors.text}
                    size={35}
                    style={{marginRight: 15}}
                  />
                  <Text style={{fontSize: 16, color: colors.text}}>
                    Edit Flash Card
                  </Text>
                </View>
              }
              styleBtn={{
                paddingHorizontal: 25,
                paddingVertical: 15,
                // backgroundColor: 'orange',
              }}
            />
            {editFlashCardModal()}
          </View>
        }
      />
    );
  };

  return (
    <View
      style={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {courseFlashCardsArr.length > 0 ? (
        <View style={studyCardsStyles.flatlistFlashCardsContainer}>
          <FlatList
            data={courseFlashCardsArr}
            keyExtractor={item => item.id}
            style={{backgroundColor: null, padding: 13}}
            numColumns={1}
            renderItem={({item}) => (
              <View
                style={{
                  backgroundColor: colors.forms,
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: '100%',
                  padding: 20,
                  marginVertical: 15,
                  borderRadius: 20,
                }}>
                <View
                  style={{
                    // backgroundColor: 'red',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingBottom: 15,
                  }}>
                  <LinearGradient
                    start={{x: 0.0, y: 0.25}}
                    end={{x: 0.5, y: 1.0}}
                    colors={[
                      courseColors[color].color1,
                      courseColors[color].color2,
                    ]}
                    style={{
                      backgroundColor: null,
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 50,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                    }}>
                    <Text style={{color: 'white', fontSize: 13}}>
                      {courseTitle}
                    </Text>
                  </LinearGradient>
                  <Button
                    onPress={() => {
                      setFlashCardId(item.id);
                      setFlashCardFrontInput(item.front);
                      setFlashCardBackInput(item.back);
                      setFlashCardFrontImg(item.frontImg);
                      setFlashCardBackImg(item.backImg);

                      setHelper_FlashCardFrontImg('');
                      setHelper_FlashCardBackImg('');
                      deleteOrEditFlashCardBottomModal.current.open();
                    }}
                    content={
                      <SimpleLineIcons
                        name="options"
                        color={colors.text}
                        size={25}
                      />
                    }
                  />
                </View>
                <Button
                  onPress={() =>
                    navigation.navigate('flashCard', {
                      flashCardFront: item.front,
                      flashCardFrontImg: item.frontImg ? item.frontImg : '',
                      flashCardBack: item.back,
                      flashCardBackImg: item.backImg ? item.backImg : '',
                    })
                  }
                  content={
                    <Text
                      style={{
                        textAlign: 'center',
                        color: colors.text,
                      }}>
                      {item.front}
                    </Text>
                  }
                  styleBtn={{
                    width: '100%',
                    backgroundColor: colors.forms,
                    paddingBottom: 30,
                  }}
                />
              </View>
            )}
          />
          <View style={studyCardsStyles.floatingButtonContainer}>
            <AddButton
              onPress={() => {
                setFlashCardFrontInput('');
                setFlashCardBackInput('');
                setFlashCardFrontImg('');
                setFlashCardBackImg('');
                createFlashCardRef.current.open();
              }}
              iconSize={60}
            />
          </View>
        </View>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Text>Agregar Card</Text>
          <AddButton
            onPress={() => {
              setFlashCardFrontInput('');
              setFlashCardBackInput('');
              setFlashCardFrontImg('');
              setFlashCardBackImg('');
              createFlashCardRef.current.open();
            }}
            iconSize={60}
          />
        </View>
      )}
      {createFlashCardModal()}
      {deleteOrEditFlashCardModal()}
    </View>
  );
};

const studyCardsStyles = StyleSheet.create({
  flatlistFlashCardsContainer: {
    backgroundColor: null,
    width: '100%',
    height: '100%',
  },
  flashCardItem: {
    width: '90%',
    paddingVertical: 40,
    justifyContent: 'center',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 25,
  },
  floatingButtonContainer: {
    position: 'absolute',
    left: '80%',
    top: '90%',
    backgroundColor: null,
  },
});

export default CourseFlashCards;
