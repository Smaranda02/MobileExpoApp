import { Stack } from "expo-router";

import { Text, View } from 'react-native'
import React from 'react'


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown : false}}/>
      {/* <Stack.Screen name="(auth)" options={{headerShown : false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown : false}}/>
      <Stack.Screen name="/search" options={{headerShown : false}}/> */}
    </Stack>
  );
}
