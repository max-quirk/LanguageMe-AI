import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Paragraph, ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import TextToSpeechButton from './TextToSpeechButton';
import RomanizeButton from './RomanizeButton';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { getPossibleTranslations, romanizeText } from '../services/chatGpt';
import { cleanLeadingHyphens, cleanPunctuation } from '../utils/readings';

type WordAndTranslationsProps = {
  word: string;
  style?: ViewStyle | ViewStyle[]
};

const WordAndTranslations: React.FC<WordAndTranslationsProps> = ({ word, style }) => {
  const { nativeLanguage, targetLanguage, targetLanguageRomanizable } = useContext(LanguageContext);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [translations, setTranslations] = useState<string[]>([]);
  const [romanized, setRomanized] = useState<string | null>(null);
  const [showRomanized, setShowRomanized] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTranslations = async () => {
      setDefinitionLoading(true);
      setTranslations([]);
      setRomanized(null);
      try {
        const translationsList = await getPossibleTranslations({
          word: cleanPunctuation(word),
          wordLanguage: targetLanguage,
          translateTo: nativeLanguage,
        });
        const translationsArray = translationsList
          ?.split('\n')
          .map(item => cleanLeadingHyphens(item))
          .filter(item => item !== '') ?? [];
        setTranslations(translationsArray);

        if (targetLanguageRomanizable) {
          const romanizedText = await romanizeText({ text: word, language: targetLanguage });
          setRomanized(romanizedText);
        }
      } catch (error) {
        console.error('Error fetching translations or romanized text:', error);
      }
      setDefinitionLoading(false);
    };

    fetchTranslations();
  }, [word, nativeLanguage, targetLanguage, targetLanguageRomanizable]);

  return (
    <View style={style}>
      <View style={tw`flex flex-row items-center`}>
        {targetLanguageRomanizable && (
          <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
        )}
        <Dialog.Title style={tw`capitalize ${targetLanguageRomanizable ? 'ml-[-10px]' : ''} ${theme.classes.textPrimary}`}>
          {showRomanized ? (
            romanized ? romanized : <ActivityIndicator size="small" />
          ) : word}
        </Dialog.Title>
        <TextToSpeechButton text={word} id={word} type={'word'} />
      </View>
      <Dialog.Content style={tw`pb-0`}>
        {definitionLoading ? (
          <ActivityIndicator style={tw`py-10`} size="large" />
        ) : (
          <View>
            <Paragraph style={tw`pl-4 ${theme.classes.textPrimary}`}>
              {translations.length > 0 ? (
                translations.map((translation, index) => (
                  <Text style={tw`text-base`} key={index}>
                    &#8226; {translation.trim()}
                    {'\n'}
                  </Text>
                ))
              ) : (
                'No translations found.'
              )}
            </Paragraph>
          </View>
        )}
      </Dialog.Content>
    </View>
  );
};

export default WordAndTranslations;
