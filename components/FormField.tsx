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
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormField = ({ title, value, handleChangeText, keyboardType, otherStyles, style, secureTextEntry = false }: any) => {
  return (
    <View style={[styles.container, otherStyles && { marginBottom: 16 }]}>
      <Text style={styles.label}>{title}</Text>
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[styles.input, style]} // allow external style override
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#003366',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // neutral color
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
});

export default FormField;
