import { View, Text } from 'react-native'
import React from 'react'
import { Tabs,Redirect } from 'expo-router'

// const TabIcon = ({icon, color, name, focused}) => {
//   return (
//     <View>
//       <Image 
//        source = {}
//       />
//     </View>
//   )
// }

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: 'red',
          tabBarInactiveTintColor: 'purple',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: 'pink',
            height: 50
          }
        }}>
        <Tabs.Screen 
          name="ledControl"
          options={{
            title: 'Led Control',
            headerShown: false,
            // tabBarIcon: ({color, focused}) => (
            //    <TabIcon 
            //     >

            //    </TabIcon>
            // )
          }}
        />
        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
         <Tabs.Screen 
          name="curtains"
          options={{
            title: 'Curtains',
            headerShown: false,
          }}
        />
        <Tabs.Screen 
          name="socket"
          options={{
            title: 'Socket',
            headerShown: false,
          }}
        />
        <Tabs.Screen 
          name="temperature"
          options={{
            title: 'Temperature',
            headerShown: false,
          }}
        />

        <Tabs.Screen 
          name="airQuality"
          options={{
            title: 'AirQuality',
            headerShown: false,
          }}
        />
      </Tabs>
    </>
  
  )
}

export default TabsLayout