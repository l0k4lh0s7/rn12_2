import React from 'react';

import {ScrollView, View, Text, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const QA = () => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Ionicons
          name="help-circle-outline"
          size={90}
          color="gray"
        />
        <Text>¿Buscas el centro de preguntas y respuestas?</Text>
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

export default QA;
