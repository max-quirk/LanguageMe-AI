import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import tw from 'twrnc';

const ThemedTextInput: React.FC<TextInputProps> = (props) => {
  const { theme, isDarkTheme } = useTheme();
  
  return (
    <TextInput
      {...props}
      style={[tw`${isDarkTheme ? theme.classes.backgroundTertiary : 'bg-[#e7e0ec]'} mb-4`, props.style]}
      placeholderTextColor={theme.colors.textSecondary}
      textColor={theme.colors.textPrimary}
      theme={{ 
        colors: { 
          primary: theme.colors.purplePrimary,
          onSurfaceVariant: theme.colors.textSecondary,
        } 
      }}
    />
  );
};

export default ThemedTextInput;
