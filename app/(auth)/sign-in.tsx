import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import { Link } from 'expo-router'

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh'>
            <Text className='text-2xl text-white text-semibold'>Log in to Stupid Home</Text>

            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e:any) => setForm({...form, email: e})}
              otherStyles="mt-7"
              keyboardType="email-address"
              />

            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(p:any) => setForm({...form, password: p})}
              otherStyles="mt-7"
              // keyboardType='password'
              />
        </View>
        
        <View className='justify-center pt-5 flex-row gap-2'>
          <Text className='text-lg text-gray-100'>
            Dont't have account?
          </Text>
          <Link href="/sign-up"
          className='text-lg font-psemibold text-secondary'>Sing Up</Link>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn