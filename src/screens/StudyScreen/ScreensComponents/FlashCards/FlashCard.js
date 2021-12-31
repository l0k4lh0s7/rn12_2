import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Animated, StyleSheet, Image} from 'react-native';

import {CachedImage, CacheManager} from '@georstat/react-native-image-cache';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Button from '../../../../components/Button';

import {useTheme} from '@react-navigation/native';

const FlashCard = ({route, navigation}) => {
  const {colors} = useTheme();
  const {flashCardFront, flashCardBack, flashCardFrontImg, flashCardBackImg} =
    route.params;

    const viewLocalCache = async () => {
      const cache = await CacheManager.getCacheSize();

      console.log('CACHE', cache)

      console.log('front cached', await CacheManager.isImageCached(flashCardFrontImg))
      console.log('back cached', await CacheManager.isImageCached(flashCardBackImg))

    }

  useEffect(() => {
    navigation.setOptions({
      title: 'Card',
    });
    viewLocalCache()
  }, [navigation]);

  const animate = useRef(new Animated.Value(0)).current;

  const [frontCard, setFrontCard] = useState(true);

  const handleFront = () => {
    setTimeout(() => {
      setFrontCard(true);
    }, 460);
    Animated.timing(animate, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const frontCardView = () => {};

  const handleBack = () => {
    setTimeout(() => {
      setFrontCard(false);
    }, 460);
    Animated.timing(animate, {
      toValue: 3,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const saveRotateValue = animate.interpolate({
    inputRange: [0, 3],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
      <Animated.View
        style={{
          height: '90%',
          width: '90%',
          backgroundColor: colors.forms,
          borderRadius: 50,
          transform: [{rotateY: saveRotateValue}],
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 5,
        }}>
        {frontCard ? (
          <>
            <CachedImage
              style={{
                width: '80%',
                height: '25%',
                resizeMode: 'cover',
                position: 'absolute',
                top: '20%',
                borderRadius: 20,
              }}
              source={
                flashCardFrontImg
                  ? flashCardFrontImg
                  : 'https://res.cloudinary.com/dpyjzquwi/image/upload/v1638396654/img_not_found_rw2zcb.png'
              }
            />
            <Text style={{color: colors.text}}>{flashCardFront}</Text>
          </>
        ) : (
          <>
            <Animated.View
              style={{
                width: '80%',
                height: '60%',
                resizeMode: 'cover',
                position: 'absolute',
                top: '10%',
                borderRadius: 20,
                backgroundColor: 'blue',
                transform: [{rotateY: saveRotateValue}],
              }}>
              <CachedImage
                style={{
                  width: '100%',
                  height: '60%',
                  // resizeMode: 'cover',
                  // position: 'absolute',
                  backgroundColor: 'red',
                  // transform: [{rotateY: saveRotateValue}],
                }}
                source={
                  flashCardBackImg
                    ? flashCardBackImg
                    : 'https://res.cloudinary.com/dpyjzquwi/image/upload/v1638396654/img_not_found_rw2zcb.png'
                }
              />
            </Animated.View>
            <Animated.Text
              style={{
                transform: [{rotateY: saveRotateValue}],
                color: colors.text,
                textAlign: 'center',
              }}>
              {flashCardBack}
            </Animated.Text>
          </>
        )}
        <View
          style={{
            backgroundColor: null,
            alignSelf: 'center',
            position: 'absolute',
            top: '89%',
            justifyContent: 'flex-end',
          }}>
          {frontCard ? (
            <View style={{alignItems: 'center'}}>
              <Button
                onPress={() => handleBack()}
                content={
                  <MaterialIcons
                    name="next-plan"
                    size={50}
                    color={colors.text}
                  />
                }
              />
              <Text style={{color: colors.text}}>GO BACK</Text>
            </View>
          ) : (
            <View style={{alignItems: 'center'}}>
              <Button
                onPress={() => handleFront()}
                content={
                  <MaterialIcons
                    name="next-plan"
                    size={50}
                    color={colors.text}
                  />
                }
              />
              <Animated.Text
                style={{
                  transform: [{rotateY: saveRotateValue}],
                  color: colors.text,
                }}>
                GO FRONT
              </Animated.Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default FlashCard;
