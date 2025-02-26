import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'

const SplashScreen = () => {
  return (
    <View style={styles.cotainer}>
      <Image source={require('../assets/images/icon.png')}
      style={styles.image}></Image>
    </View>
  )
}

export default SplashScreen;

const styles = StyleSheet.create({
    cotainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    image:{
        width: 350,
        height: 350,
        resizeMode: 'cover'
    }
});
