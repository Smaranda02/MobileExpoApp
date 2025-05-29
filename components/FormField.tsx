// import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native'
// import React, { useState } from 'react'

// const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props} : {
//     title?: string;
//     value: string;
//     placeholder?: string;
//     handleChangeText: (text: string) => void;
//     otherStyles: string,
//   } & TextInputProps)  => {


//     const [showPassword, setShowPassword] = useState(false);

//   return (
//     <View className={`space-y-2 ${otherStyles}`}>
//       <Text>{title}</Text>

//       <View className="border-2 border-black-500 w-full bg-black-100
//       rounded-2xl focus:border-secondary">
//         <TextInput className='flex-1 text-black text-base bg-red'
//         value={value}
//         placeholder={placeholder} 
//         onChangeText={handleChangeText}
//         secureTextEntry={title === 'Password'}
//         />

//         {/* <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Text className={` text-primary font-psemibold `}>Show</Text>
//         </TouchableOpacity> */}

//       </View>
//     </View>
//   )
// }

// export default FormField



import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';

const FormField = ({ title, value, handleChangeText, keyboardType, otherStyles, style, secureTextEntry = false }: any) => {
  return (
    <View style={ Platform.OS =='web' ? 
      [styles.containerWeb, otherStyles && { marginBottom: 16 }]
     : [styles.container, otherStyles && { marginBottom: 16 }]}>
      <Text style={Platform.OS =='web' ? styles.labelWeb : styles.label}>
        {title}
      </Text>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={Platform.OS == 'web' ? [styles.inputWeb, style] : [styles.input, style]} // allow external style override
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  containerWeb: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginBottom: 6,
    color: '#003366',
    fontWeight: '500',
    fontSize: 16
  },
  labelWeb: {
    marginBottom: 6,
    color: '#003366',
    fontWeight: '500',
    fontSize: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // neutral color
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
   inputWeb: {
    borderWidth: 1,
    borderColor: '#ccc', // neutral color
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    alignItems: "center",
    width: 800
  },
});

export default FormField;
