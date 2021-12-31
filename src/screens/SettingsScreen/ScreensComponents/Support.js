import React from 'react';

import {ScrollView, View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

const Support = () => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Feather
          name="mail"
          size={90}
          color="gray"
        />
        <Text>¿Buscas el centro de soporte o ayuda?</Text>
        <Text>Visita el sitio web de Skool para mas información.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '100%',
    paddingVertical: 80,
  },
});

export default Support;
