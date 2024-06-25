import React, { useContext, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, TextInput, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { generateReadingPassage } from '../../../services/chatGpt';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { RootStackParamList } from '../../../types'; 
import Button from '../../Button';

type AddReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddReading'>;

const AddReadingScreen: React.FC = () => {
  const { targetLanguage } = useContext(LanguageContext);

  const navigation = useNavigation<AddReadingsListScreenNavigationProp>();
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [wordCount, setWordCount] = useState<string>('100');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddReading = async () => {
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('No user is authenticated');
      }
      const passage = await generateReadingPassage({ targetLanguage, description, difficulty, wordCount });

      const readingRef = await firebase.firestore().collection('users').doc(user.uid).collection('readings').add({
        description,
        difficulty,
        wordCount,
        passage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const reading = {
        id: readingRef.id,
        description,
        difficulty,
        wordCount,
        passage,
        createdAt: new Date(),
      };

      navigation.navigate('Reading', { reading });
    } catch (error) {
      console.error('Error adding reading:', error);
    }
    setLoading(false);
  };

  const getBackgroundColor = (value: string) => {
    return value === difficulty ? '#cec8d3' : '#e7e0ec'; 
  };

  return (
    <ScrollView style={tw`flex-1 p-5 mt-20`}>
      <Text style={tw`text-2xl mb-4`}>New Reading</Text>
      <TextInput
        label="What do you want to read about?"
        value={description}
        onChangeText={setDescription}
        style={tw`mb-4`}
        placeholder="E.g. History of the Roman Empire"
      />
      <Text style={tw`mb-2 mt-4 text-base`}>Difficulty</Text>
      <RadioButton.Group
        onValueChange={(newDifficulty: string) => setDifficulty(newDifficulty)}
        value={difficulty}
      >
        <RadioButton.Item label="Beginner" value="easy" style={tw`border-b rounded-t-[4px] border-slate-300 bg-[${getBackgroundColor('easy')}]`} labelStyle={tw`text-sm`} />
        <RadioButton.Item label="Intermediate" value="medium" style={tw`border-b border-slate-300 bg-[${getBackgroundColor('medium')}]`} labelStyle={tw`text-sm`} />
        <RadioButton.Item label="Advanced" value="hard" style={tw`border-b border-gray-400 bg-[${getBackgroundColor('hard')}]`} labelStyle={tw`text-sm`} />
      </RadioButton.Group>
      <TextInput
        label="Word Count"
        value={wordCount}
        onChangeText={setWordCount}
        keyboardType="numeric"
        style={tw`mb-4 mt-6`}
      />
      <Button
        mode="contained"
        onPress={handleAddReading}
        loading={loading}
        style={tw`mt-4 bg-purple-600`}
      >
        Generate Reading
      </Button>
    </ScrollView>
  );
};

export default AddReadingScreen;
