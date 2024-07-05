import React, { useContext, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { generateReadingPassage } from '../../../services/chatGpt';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { Reading, RootStackParamList } from '../../../types'; 
import Button from '../../Button';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedTextInput from '../../ThemedTextInput';
import { useTranslation } from 'react-i18next';

type AddReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReading'>;

const AddReadingScreen: React.FC = () => {
  const { targetLanguage } = useContext(LanguageContext);
  const { theme, isDarkTheme } = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation<AddReadingsListScreenNavigationProp>();
  const [title, setTitle] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [wordCount, setWordCount] = useState<string>('100');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const MAX_WORD_COUNT = 1000;

  const handleAddReading = async () => {
    const wordCountNum = parseInt(wordCount, 10);
    if (wordCountNum > MAX_WORD_COUNT) {
      setError(t('word_count_exceed', { max: MAX_WORD_COUNT }));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('No user is authenticated');
      }
      const passage = await generateReadingPassage({ 
        targetLanguage, 
        description: title, 
        difficulty, 
        wordCount: wordCountNum 
      });
      const description = passage.slice(0, Math.min(passage.length, 70))
      const readingRef = await firebase.firestore().collection('users').doc(user.uid).collection('readings').add({
        title,
        description,
        difficulty,
        wordCount: wordCountNum,
        passage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const reading = {
        id: readingRef.id,
        title,
        description,
        difficulty,
        wordCount: wordCountNum,
        passage,
        wordTimestamps: null,
      } as Reading;

      navigation.navigate('Reading', { reading, readingId: reading.id });
    } catch (error) {
      console.error('Error adding reading:', error);
    }
    setLoading(false);
  };

  const getBackgroundClass = (value: 'easy' | 'medium' | 'hard') => {
    if (isDarkTheme) {
      return value === difficulty ? theme.classes.backgroundSecondary : theme.classes.backgroundTertiary; 
    }
    return value === difficulty ? 'bg-[#cec8d3]' : 'bg-[#e7e0ec]'; 
  };

  return (
    <ScrollView style={tw`flex-1 p-5 pt-20 ${theme.classes.backgroundPrimary}`}>
      <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{t('new_reading')}</Text>
      <ThemedTextInput
        label={t('reading_topic')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('reading_topic_placeholder')}
      />
      <Text style={tw`mb-2 mt-4 text-base ${theme.classes.textPrimary}`}>{t('difficulty')}</Text>
      <RadioButton.Group
        onValueChange={(newDifficulty: string) => setDifficulty(newDifficulty)}
        value={difficulty}
      >
        <RadioButton.Item 
          label={t('beginner')} 
          value="easy" 
          style={tw`border rounded-t-[4px] ${theme.classes.borderPrimary} ${getBackgroundClass('easy')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
        <RadioButton.Item 
          label={t('intermediate')} 
          value="medium" 
          style={tw`border border-t-0 ${theme.classes.borderPrimary} ${getBackgroundClass('medium')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
        <RadioButton.Item 
          label={t('advanced')} 
          value="hard" 
          style={tw`border border-t-0 ${theme.classes.borderPrimary} ${getBackgroundClass('hard')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
      </RadioButton.Group>
      <ThemedTextInput
        label={t('word_count')}
        value={wordCount}
        onChangeText={setWordCount}
        keyboardType="numeric"
        style={tw`mt-6`}
      />
      {error ? <Text style={tw`text-red-600 mt-2`}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handleAddReading}
        loading={loading}
        style={tw`mt-4 bg-purple-600`}
      >
        {t('generate_reading')}
      </Button>
    </ScrollView>
  );
};

export default AddReadingScreen;
