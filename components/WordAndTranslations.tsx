import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Paragraph, ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import RomanizeButton from './RomanizeButton';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { getPossibleTranslations, romanizeText } from '../services/chatGpt';
import { cleanLeadingHyphens, cleanPunctuation } from '../utils/readings';

type WordAndTranslationsProps = {
  word: string;
  style?: ViewStyle | ViewStyle[]
  translationsList: string[] | null
  setTranslationsList: (_translationsList: string[]) => void
  wordLoading?: boolean
};

const WordAndTranslations: React.FC<WordAndTranslationsProps> = ({ 
  word, 
  style,
  translationsList,
  setTranslationsList,
  wordLoading,
 }) => {
  const { nativeLanguage, targetLanguage, targetLanguageRomanizable } = useContext(LanguageContext);
  const [romanized, setRomanized] = useState<string | null>(null);
  const [translationsFetchLoading, setTranslationsFetchLoading] = useState<boolean>(false)
  const [showRomanized, setShowRomanized] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    const fetchAndStoreTranslations = async () => {
      setTranslationsFetchLoading(true)
      setTranslationsList?.([]);
      setRomanized(null);
      try {
        const _translationsList = await getPossibleTranslations({
          word: cleanPunctuation(word),
          wordLanguage: targetLanguage,
          translateTo: nativeLanguage,
        });
        const translationsArray = _translationsList
          ?.split('\n')
          .map(item => cleanLeadingHyphens(item))
          .filter(item => item !== '') ?? [];
        setTranslationsList?.(translationsArray);
        setTranslationsFetchLoading(false)
      } catch (error) {
        console.error('Error fetching translations or romanized text:', error);
      }
    };
    if (!translationsList && !wordLoading) {
      fetchAndStoreTranslations();
    }
  }, []);

  useEffect(() => {
    const getRomanized = async () => {
      const romanizedText = await romanizeText({ text: word, language: targetLanguage });
      setRomanized(romanizedText);
    }
    if (targetLanguageRomanizable) {
      getRomanized()
    }
  }, [word, targetLanguage, targetLanguageRomanizable])

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
      </View>
      <Dialog.Content style={tw`pb-0`}>
        {wordLoading || translationsFetchLoading ? (
          <ActivityIndicator style={tw`py-10`} size="large" />
        ) : (
          <View>
            <Paragraph style={tw`pl-4 ${theme.classes.textPrimary}`}>
              {translationsList && translationsList.length > 0 ? (
                translationsList.map((translation, index) => (
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
