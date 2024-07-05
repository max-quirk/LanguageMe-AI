import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, MD3DarkTheme as DarkTheme, Provider as PaperProvider } from 'react-native-paper';

const themes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      textPrimary: '#1c1b1f',
      textSecondary: '#4b5563',
      textTertiary: '#676d75',
      backgroundPrimary: '#f8f4f4',
      purplePrimary: '#7C3AED', // purple-500
      tomato: '#ff644c',
    },
    classes: {
      backgroundPrimary: 'bg-[#f8f4f4]',
      backgroundSecondary: 'bg-[#ffffff]',
      backgroundTertiary: 'bg-[#fafafa]',
      textPrimary: 'text-[#1c1b1f]',
      textSecondary: 'text-[#4b5563]',
      textTertiary: 'text-[#676d75]',
      borderPrimary: 'border-gray-300'
    }
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      textPrimary: '#e0e1e0',
      textSecondary: '#a1abb9',
      backgroundPrimary: '#181414',
      purplePrimary: '#c084fc', // purple-400
      tomato: '#ff644c',
    },
    classes: {
      backgroundPrimary: 'bg-[#181414]',
      backgroundSecondary: 'bg-[#16141d]',
      backgroundTertiary: 'bg-[#332c3f]',
      textPrimary: 'text-[#e0e1e0]',
      textSecondary: 'text-[#a1abb9]',
      borderPrimary: 'border-gray-600'
    }
  },
};

type ThemeContextType = {
  theme: typeof themes.light;
  toggleTheme: () => void;
  isDarkTheme: boolean
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme !== null) {
        setIsDarkTheme(storedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDarkTheme ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
