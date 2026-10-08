import { View, Text } from 'react-native'
import React from 'react'

import { Stack } from 'expo-router'

const Others = () => {
  return (
    <Stack  screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
        
      <Stack.Screen  name='others-screen'/>
        
        
    </Stack>
    
  )
}

export default Others