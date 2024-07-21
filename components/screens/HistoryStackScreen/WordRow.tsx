import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { ActivityIndicator } from 'react-native-paper';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { romanizeText } from '../../../services/chatGpt';

type WordRowProps = {
  word: string;
  translation: string;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const WordRow: React.FC<WordRowProps> = ({
  word,
  translation,
  onPress,
  isFirst,
  isLast,
}) => {
  const { theme } = useTheme();
  const { targetLanguageRomanizable, targetLanguage } = useContext(LanguageContext);
  const [showRomanized, setShowRomanized] = useState(false);
  const [wordRomanized, setWordRomanized] = useState<string | null>(null);
  const [romanizedLoading, setRomanizedLoading] = useState<boolean>(false);

  const roundedTop: ViewStyle = { borderTopLeftRadius: 8, borderTopRightRadius: 8 };
  const roundedBottom: ViewStyle = { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw`${theme.classes.backgroundTertiary} relative border ${theme.classes.borderPrimary} ${isLast ? '' : 'border-b-0'}`,
        isFirst ? roundedTop : null,
        isLast ? roundedBottom : null,
      ]}
    >
      <View
        style={[
          tw`flex-row items-center justify-between w-full pl-4 pr-3`,
          targetLanguageRomanizable ? {} : tw`py-2`,
        ]}
      >
        <View style={tw`flex-row items-center flex-1`}>
          {targetLanguageRomanizable && (
            <RomanizeButton 
              show={!showRomanized} 
              onPress={async () => {
                setShowRomanized(!showRomanized);
                if (word && !wordRomanized) {
                  setRomanizedLoading(true);
                  const romanized = await romanizeText({ text: word, language: targetLanguage });
                  setWordRomanized(romanized);
                  setRomanizedLoading(false);
                }
              }}
              style={tw`mr-[-5px]`}
            />
          )}
          {showRomanized ? 
            <>
              {romanizedLoading ? 
                <ActivityIndicator size="small" color={theme.colors.textPrimary} style={tw``} /> 
              : 
                <Text style={tw`${theme.classes.textPrimary} text-lg`}>{wordRomanized}</Text> 
              }
            </>
          : 
            <Text style={[tw`${theme.classes.textPrimary} text-lg`, showRomanized ? {} : tw`capitalize`]}>{word}</Text>
          }
          <View style={tw`flex-1 ml-2`}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={tw`text-base capitalize ${theme.classes.textSecondary}`}
            >
              / {translation}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={30} color={theme.colors.textPrimary} />
      </View>
    </TouchableOpacity>
  );
};

export default WordRow;
