import React from 'react'
import { Tabs,Redirect } from 'expo-router'
import Profile from '../profile'
import { FontAwesome } from '@expo/vector-icons'
import { Platform } from 'react-native'


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
            tabBarIcon: Platform.OS == "web" ? 
            ({ color }) => <FontAwesome size={45} name="lightbulb-o" color={color} />
            :
            ({ color }) => <FontAwesome size={28} name="lightbulb-o" color={color} />,
              tabBarLabelStyle: Platform.OS === "web" ? { fontSize: 30 } : {}, 
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
            tabBarIcon:  Platform.OS == "web" ? 
            ({ color }) => <FontAwesome size={40} name="thermometer-half" color={color} />
            :
             ({ color }) => <FontAwesome size={22} name="thermometer-half" color={color} />,

            tabBarLabelStyle: Platform.OS === "web" ? { fontSize: 30 } : {}, 

          }}
        />

        <Tabs.Screen 
          name="airQuality"
          options={{
            title: 'AQI',
            headerShown: false,
            tabBarIcon: Platform.OS == 'web' ? 
              ({ color }) => <FontAwesome size={35} name="leaf" color={color} />
              :
              ({ color }) => <FontAwesome size={19} name="leaf" color={color} />,
              tabBarLabelStyle: Platform.OS === "web" ? { fontSize: 30 } : {}, 
          }}
        />

        <Tabs.Screen 
            name="consumption"
            options={{
              title: 'Consumption',
              headerShown: false,
              tabBarIcon: Platform.OS == "web" ?
              ({ color }) => <FontAwesome size={33} name="bar-chart" color={color} />
              :
              ({ color }) => <FontAwesome size={19} name="bar-chart" color={color} />,
              tabBarLabelStyle: Platform.OS === "web" ? { fontSize: 30 } : {}, 
            }}
        />

         <Tabs.Screen 
            name="programControl"
            options={{
              title: 'Others',
              headerShown: false,
              tabBarIcon: Platform.OS == 'web' ?
              ({ color }) => <FontAwesome size={30} name="bars" color={color} />
              :
              ({ color }) => <FontAwesome size={19} name="bars" color={color} />,
              tabBarLabelStyle: Platform.OS === "web" ? { fontSize: 30 } : {}, 
            }}
        />
        
      </Tabs>  
  )
}

export default TabsLayout