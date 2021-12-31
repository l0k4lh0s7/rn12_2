import React from 'react';

import {ScrollView, View, Text, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyPolicy = () => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Ionicons
          name="shield-checkmark-outline"
          size={90}
          color="gray"
        />
        <Text>¿Buscas el centro de Politica de Privacidad?</Text>
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

export default PrivacyPolicy;
