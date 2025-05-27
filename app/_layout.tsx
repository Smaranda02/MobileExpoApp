import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SessionProvider } from "@/services/authContext";
import { DARKER_PRIMARY, PRIMARY_COLOR } from "@/constants";

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
            headerTitleStyle: {
              fontSize: 24,
              color: DARKER_PRIMARY,
            },
          }} 
        />
      </Stack>
   </SessionProvider>
  );
}

const styles = StyleSheet.create({});
