import { router, Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { SessionProvider } from "@/services/authContext";
import { DARKER_PRIMARY, PRIMARY_COLOR } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="firstPage" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: true, 
            title: 'Back to Home',
            headerTitleStyle: Platform.OS == 'web' ? 
            {fontSize: 35, color: DARKER_PRIMARY, } 
            :
            {fontSize: 24, color: DARKER_PRIMARY,} , 
            headerLeft: 
            () => (
            <TouchableOpacity onPress={() => router.push('/firstPage')} style={{ paddingHorizontal: 15 }}>
              <Ionicons name="arrow-back" size={24} color={DARKER_PRIMARY} />
            </TouchableOpacity>
            )      
          }} 
        />
      </Stack>
   </SessionProvider>
  );
}

const styles = StyleSheet.create({});
