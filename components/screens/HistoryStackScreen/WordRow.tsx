import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { FlashCard } from '../../../types';
import ThemedCard from '../../ThemedCard';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';

type WordRowProps = {
  card: FlashCard;
  showTranslations: boolean;
  onPress: () => void;
  isFirst: boolean
  isLast: boolean
};

const WordRow: React.FC<WordRowProps> = ({ 
  card, 
  showTranslations, 
  onPress, 
  isFirst,
  isLast,
}) => {
  const { theme } = useTheme();
  const [showRomanized, setShowRomanized] = useState(false);

  const roundedTop: ViewStyle = { borderTopLeftRadius: 8, borderTopRightRadius: 8 }
  const roundedBottom: ViewStyle = { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw`overflow-hidden ${theme.classes.backgroundTertiary} border ${theme.classes.borderPrimary} ${isLast ? 'shadow-lg' : 'border-b-0'}`,
        isFirst ? roundedTop : null,
        isLast ? roundedBottom : null,
      ]}    
    >
      <View style={tw`flex-row items-center justify-between w-full pl-4 pr-3`}>
        <View style={tw`flex-row items-center`}>
          {card.front.wordRomanized && (
            <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
          )}
          <Text style={tw`${theme.classes.textPrimary} text-lg`}>
            {showRomanized ? card.front.wordRomanized : card.front.word}
          </Text>
          {showTranslations && <Text style={tw`ml-2 text-lg capitalize ${theme.classes.textSecondary}`}> /   {card.back.word}</Text>}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={30} color={theme.colors.textPrimary} />
      </View>
    </TouchableOpacity>
  );
};

export default WordRow;
