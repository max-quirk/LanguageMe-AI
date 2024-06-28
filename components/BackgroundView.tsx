import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import tw from 'twrnc';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

const BackgroundView: React.FC<Props> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[tw`flex-1 ${theme.classes.backgroundPrimary}`, style]}>
      {children}
    </View>
  );
};

export default BackgroundView;
