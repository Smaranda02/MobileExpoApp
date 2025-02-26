import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import { Link } from 'expo-router'

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh'>
            <Text className='text-2xl text-white text-semibold'>Sign Up to Stupid Home</Text>


            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e:any) => setForm({...form, username: e})}
              otherStyles="mt-7"
              keyboardType="email-address"
              />


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
            Have an account already?
          </Text>
          <Link href="/sign-in"
          className='text-lg font-psemibold text-secondary'>Sing In</Link>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp