import { Text, TouchableOpacity, View, Button, TextInput, StyleSheet } from "react-native";
import { Link, Redirect, router } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import CustomButton from "@/components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import Voice from "@react-native-voice/voice";
// import { AssemblyAI } from 'assemblyai';
import * as FileSystem from 'expo-file-system';
import axios from "axios";
import SplashScreen from "./splashScreen";

export default function FirstPage() {
  
  return (

    // <SafeAreaView style={styles.container}>

    //   {/* <ScrollView style={styles.container}> */}
        <View style={styles.container}>
          
          <Text style={styles.text}>Welcome to your Smart Home controller</Text>

            <Link href="/ledControl" style={styles.link}>
                Led Control
            </Link>

            <Link href="/voiceControl" style={styles.link}>
                Voice control
            </Link>

            <Link href="/temperature" style={styles.link}>
                Temperature control
            </Link>

            <Link href="/socket" style={styles.link}>
                Smart socket control
            </Link>

            <Link href="/curtains" style={styles.link}>
                Curtains control
            </Link>

            <Link href="/airQuality" style={styles.link}>
                Air quality
            </Link>


          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
            textStyles={""}
            isLoading={false}
          />
        
      {/* </ScrollView> */}

      <StatusBar backgroundColor="#161622" style="light" />

      </View>


    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#b3bffd',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 20
   
  },
  link: {
    color: "blue",
    paddingTop: 10,
    fontSize: 17,
    borderBlockColor: 'blue',
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    
  }
});