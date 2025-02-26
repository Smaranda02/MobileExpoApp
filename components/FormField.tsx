import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props} : {
    title?: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles: string,
  } & TextInputProps)  => {


    const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text>{title}</Text>

      <View className="border-2 border-red-500 w-full bg-black-100
      rounded-2xl focus:border-secondary">
        <TextInput className='flex-1 text-black text-base bg-red'
        value={value}
        placeholder={placeholder} 
        onChangeText={handleChangeText}
        secureTextEntry={title === 'Password'}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text className={` text-primary font-psemibold `}>Show</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default FormField