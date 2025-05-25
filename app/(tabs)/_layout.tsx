import React from 'react'
import { Tabs,Redirect } from 'expo-router'
import Profile from '../profile'
import { FontAwesome } from '@expo/vector-icons'


const TabsLayout = () => {
  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'black',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: 'pink',
            height: 85,
            // marginBottom: 20
          }
        }}>
        <Tabs.Screen 
          name="ledControl"
          options={{
            // href:null,
            title: 'LEDs',
            headerShown: false,
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="lightbulb-o" color={color} />,
          }}
        />
        {/* <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        /> */}
        
        <Tabs.Screen 
          name="temperature"
          options={{
            title: 'Temperature',
            headerShown: false,
            tabBarIcon: ({ color }) => <FontAwesome size={22} name="thermometer-half" color={color} />,
          }}
        />

        <Tabs.Screen 
          name="airQuality"
          options={{
            title: 'AQI',
            headerShown: false,
            tabBarIcon: ({ color }) => <FontAwesome size={19} name="leaf" color={color} />,
          }}
        />

        <Tabs.Screen 
            name="consumption"
            options={{
              title: 'Consumption',
              headerShown: false,
              tabBarIcon: ({ color }) => <FontAwesome size={19} name="bar-chart" color={color} />,
            }}
        />

         <Tabs.Screen 
            name="programControl"
            options={{
              title: 'Others',
              headerShown: false,
              tabBarIcon: ({ color }) => <FontAwesome size={19} name="bars" color={color} />,
            }}
        />
        
      </Tabs>  
  )
}

export default TabsLayout