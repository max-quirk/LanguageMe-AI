import React, { useState } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from '../contexts/ThemeContext';

type CollapseProps = {
  label: string;
  hideLabel?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle | ViewStyle[]
};

const Collapse: React.FC<CollapseProps> = ({ label, hideLabel=label, children, contentStyle }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={tw`flex flex-row justify-between items-center h-11`}
      >
        <Text style={tw`font-bold ${theme.classes.textPrimary}`}>{isVisible ? hideLabel : label}</Text>
        <IconButton icon={isVisible ? 'chevron-up' : 'chevron-down'} size={20} iconColor={theme.colors.textPrimary} />
      </TouchableOpacity>
      {isVisible && (
        <View style={[tw`mt-0`, contentStyle]}>
          {children}
        </View>
      )}
    </View>
  );
};

export default Collapse;
