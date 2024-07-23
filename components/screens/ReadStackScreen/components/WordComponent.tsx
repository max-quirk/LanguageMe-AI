import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { extractPunctuation } from '../../../../utils/readings';
import { useTheme } from '../../../../contexts/ThemeContext';

type Props = {
  word: string;
  paragraphIndex: number;
  wordIndex: number;
  handleWordPress: (word: string) => void;
  isHighlighted: boolean;
  isFlashing: boolean;
};

const WordComponent: React.FC<Props> = ({ 
  word, 
  paragraphIndex, 
  wordIndex, 
  handleWordPress, 
  isHighlighted,
  isFlashing,
}) => {
  const { punctuationBefore, punctuationAfter, coreWord } = extractPunctuation(word);
  const { theme } = useTheme();

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let flashInterval: NodeJS.Timeout;
    if (isFlashing) {
      flashInterval = setInterval(() => {
        setFlash(prev => !prev);
      }, 500);
    } else {
      setFlash(false);
    }

    return () => {
      if (flashInterval) {
        clearInterval(flashInterval);
      }
    };
  }, [isFlashing]);

  const color = isHighlighted ? `text-[${theme.colors.tomato}]` : theme.classes.textPrimary;
  const backgroundColor = flash ? 'bg-purple-300' : 'transparent';

  return (
    <View key={`${word}-${paragraphIndex}-${wordIndex}`} style={tw`flex-row`}>
      {punctuationBefore ? (
        <Text style={tw`text-xl leading-9 ${color}`}>{punctuationBefore}</Text>
      ) : null}
      <TouchableOpacity onPress={() => handleWordPress(coreWord)}>
        <View style={tw`${backgroundColor} rounded-sm`}>
        <Text style={tw`text-xl leading-9 ${color}`}>
          {coreWord}
        </Text>
        </View>
      </TouchableOpacity>
      {punctuationAfter ? (
        <Text style={tw`text-xl leading-9 ${color}`}>{punctuationAfter}</Text>
      ) : null}
      <Text>{'\u00A0'}</Text>
    </View>
  );
};

export default WordComponent;
