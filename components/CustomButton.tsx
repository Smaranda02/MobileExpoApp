import { View, Text, TouchableOpacity, TextStyle, ViewStyle } from 'react-native'
import React from 'react'


const CustomButton = ({
    title,
    handlePress,
    containerStyles,
    textStyles,
    isLoading
  }: {
    title: string;
    handlePress : () => void ;
    containerStyles?: string;
    textStyles?: string;
    isLoading?: boolean;
  }) => {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className={`bg-secondary rounded-xl min-h-[62px] justify-center
          ${containerStyles} 
          ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
      >
        <Text className={` text-primary font-psemibold 
            ${textStyles}`}>{title}</Text>
      </TouchableOpacity>
    );
  };


// const CustomButton = ({ handlePress }: { handlePress: () => void }) => {
//     return (
//       <TouchableOpacity 
//     onPress={handlePress}
//      activeOpacity={0.7}
//       className={
//           `bg-secondary rounded-xl justify-center items-center}`
//       }
//       disabled={false}>
//         <Text className={`text-primary font-psemibold text-lg`}>Click me</Text>
//       </TouchableOpacity>
//     )
//   }

export default CustomButton