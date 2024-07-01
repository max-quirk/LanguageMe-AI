import { Text } from "react-native-paper"
import React from 'react'
import tw from 'twrnc'
import { useTheme } from "../contexts/ThemeContext"

export function ScreenTitle({
  title
}: {
  title: string
}) {
  const { theme } = useTheme()
  return ( 
    <Text style={tw`text-3xl mb-6 text-center font-bold ${theme.classes.textPrimary}`}>{title}</Text>
  )
}
