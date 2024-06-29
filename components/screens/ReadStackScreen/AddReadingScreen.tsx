import React, { useContext, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { generateReadingPassage } from '../../../services/chatGpt';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { RootStackParamList } from '../../../types'; 
import Button from '../../Button';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedTextInput from '../../ThemedTextInput';

type AddReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReading'>;

const AddReadingScreen: React.FC = () => {
  const { targetLanguage } = useContext(LanguageContext);
  const { theme, isDarkTheme } = useTheme();

  const navigation = useNavigation<AddReadingsListScreenNavigationProp>();
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [wordCount, setWordCount] = useState<string>('100');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const MAX_WORD_COUNT = 1000;

  const handleAddReading = async () => {
    const wordCountNum = parseInt(wordCount, 10);
    if (wordCountNum > MAX_WORD_COUNT) {
      setError(`Word count cannot exceed ${MAX_WORD_COUNT} words.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('No user is authenticated');
      }
      const passage = await generateReadingPassage({ targetLanguage, description, difficulty, wordCount: wordCountNum });

      const readingRef = await firebase.firestore().collection('users').doc(user.uid).collection('readings').add({
        description,
        difficulty,
        wordCount: wordCountNum,
        passage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const reading = {
        id: readingRef.id,
        description,
        difficulty,
        wordCount: wordCountNum,
        passage,
        createdAt: new Date(),
      };

      navigation.navigate('Reading', { reading });
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
      <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>New Reading</Text>
      <ThemedTextInput
        label="What do you want to read about?"
        value={description}
        onChangeText={setDescription}
        placeholder="E.g. History of the Roman Empire"
      />
      <Text style={tw`mb-2 mt-4 text-base ${theme.classes.textPrimary}`}>Difficulty</Text>
      <RadioButton.Group
        onValueChange={(newDifficulty: string) => setDifficulty(newDifficulty)}
        value={difficulty}
      >
        <RadioButton.Item 
          label="Beginner" 
          value="easy" 
          style={tw`border rounded-t-[4px] ${theme.classes.borderPrimary} ${getBackgroundClass('easy')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
        <RadioButton.Item 
          label="Intermediate" 
          value="medium" 
          style={tw`border border-t-0 ${theme.classes.borderPrimary} ${getBackgroundClass('medium')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
        <RadioButton.Item 
          label="Advanced" 
          value="hard" 
          style={tw`border border-t-0 ${theme.classes.borderPrimary} ${getBackgroundClass('hard')}`} 
          labelStyle={tw`text-sm ${theme.classes.textPrimary}`} 
          theme={{ colors: { primary: theme.colors.purplePrimary } }} 
        />
      </RadioButton.Group>
      <ThemedTextInput
        label="Word Count"
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
        style={tw`mt-4 ${loading ? 'bg-grey-500' : 'bg-purple-600'}`}
      >
        Generate Reading
      </Button>
    </ScrollView>
  );
};

export default AddReadingScreen;
