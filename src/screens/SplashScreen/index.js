import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

const SplashScreen = props => {
    
    return (
        <View style={{
                ...styles.container,
                backgroundColor: props.theme.colors.background}}>
            <Text style={{
                ...styles.waiting,
                color: props.theme.colors.text
                }}>Waiting</Text>
            <Text style={{
                    ...styles.logo,
                    color: props.theme.colors.text
                }}>Logo</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    waiting: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    logo: {
        position: 'absolute',
        fontSize: 30,
        bottom: 70
    }
});

export default SplashScreen;
