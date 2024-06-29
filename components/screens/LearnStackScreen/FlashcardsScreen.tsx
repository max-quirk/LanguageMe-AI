import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text, Card as PaperCard, ActivityIndicator } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { FlashCard, RootStackParamList } from 'types';
import { DEFAULT_INTERVALS, Ease, getNextCard, getNextIntervals, adjustCard } from '../../../utils/flashcards';
import FlashcardEaseButtons from './FlashcardEaseButtons';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser, setFirstTimeUser } from '../../../utils/storageUtils';
import Button from '../../Button';
import TextToSpeechButton from '../../TextToSpeechButton';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundView from '../../BackgroundView';

type FlashcardsScreenNavigationProp = NavigationProp<RootStackParamList>;

const FlashcardsScreen = () => {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashCard | null>(null);
  const [isFront, setIsFront] = useState(true);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [frontCardHelperVisible, setFrontCardHelperVisible] = useState(false);
  const [backCardHelperVisible, setBackCardHelperVisible] = useState(false);
  const [showRomanized, setShowRomanized] = useState(false);
  const [_firstTimeUser, _setFirstTimeUser] = useState(false);

  const navigation = useNavigation<FlashcardsScreenNavigationProp>();
  const { theme } = useTheme();

  const cardNextIntervals = currentFlashcard ? getNextIntervals(currentFlashcard) : DEFAULT_INTERVALS;

  const fetchFlashcards = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      const flashcardsSnapshot = await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .collection('flashcards')
        .get();
      const cards: FlashCard[] = flashcardsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          due: data.due.toDate()
        } as FlashCard;
      });

      // Filter out flashcards that are due tomorrow or later
      const now = new Date();
      const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const todayFlashcards = cards.filter(card => card.due < startOfTomorrow);
      setFlashcards(todayFlashcards);
      const nextCard = getNextCard(todayFlashcards);
      setCurrentFlashcard(nextCard);
      setCompleted(!nextCard && cards.length > 0);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const initialize = async () => {
      const firstTimeUser = await isFirstTimeUser();
      if (firstTimeUser) {
        _setFirstTimeUser(true);
        setTimeout(() => {
          setFrontCardHelperVisible(true);
        }, 1000);
      }
      fetchFlashcards();
    };
    initialize();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFlashcards();
  };

  const handleNextFlashcard = async (ease: Ease) => {
    if (currentFlashcard) {
      const { card } = await adjustCard(currentFlashcard, ease); // Adjust card and save to Firebase
      const updatedFlashcards = flashcards.map(fc => fc.id === card.id ? card : fc);
      const now = new Date();
      const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const filteredFlashcards = updatedFlashcards.filter(fc => fc.due < startOfTomorrow); // Filter out due tomorrow or later
      setFlashcards(filteredFlashcards);
      const nextCard = getNextCard(filteredFlashcards.length > 1 ? filteredFlashcards.filter(fc => fc.id !== card.id) : filteredFlashcards);
      setCurrentFlashcard(nextCard);
      setCompleted(!nextCard);
      setIsFront(true);
    }
  };

  const handleFlipCard = () => {
    setIsFront(!isFront);
    if (_firstTimeUser) {
      setTimeout(() => {
        setBackCardHelperVisible(true);
        // End of first time user flow popups
        setFirstTimeUser(false);
        _setFirstTimeUser(false);
      }, 1000);
    }
    setFrontCardHelperVisible(false);
  };

  const frontWord = currentFlashcard?.front.word;
  const frontWordRomanized = currentFlashcard?.front.wordRomanized;
  const frontExampleSentence = currentFlashcard?.front.example;
  const frontExampleRomanized = currentFlashcard?.front.exampleRomanized;

  const renderCardContent = () => {
    if (isFront) {
      return (
        <View>
          <Text style={[tw`text-2xl mb-4 capitalize ${theme.classes.textPrimary}`]}>
            {showRomanized && frontWordRomanized ? 
              frontWordRomanized : 
              frontWord}
          </Text>
          <Text style={[tw`text-lg mb-4 ${theme.classes.textPrimary}`]}>
            {showRomanized && frontExampleRomanized ? 
              frontExampleRomanized : 
              frontExampleSentence}
          </Text>
          <View style={tw`flex items-center mt-4`}>
            <TextToSpeechButton 
              type='flashcard' 
              text={`${frontWord}. ${frontExampleSentence}`} 
              id={currentFlashcard?.id ?? `flashcard_${frontWord}`} 
              size={28}
            />
          </View>
          {(frontWordRomanized || frontExampleRomanized) && (
            <RomanizeButton 
              show={!showRomanized} 
              onPress={() => setShowRomanized(!showRomanized)} 
              style={tw`absolute right-0 top-[-15px]`}
            />
          )}
        </View>
      );
    } else {
      return (
        <>
          <Text style={tw`text-2xl mb-4 capitalize ${theme.classes.textPrimary}`}>{currentFlashcard?.back.word}</Text>
          <Text style={tw`text-lg mb-6 ${theme.classes.textPrimary}`}>{currentFlashcard?.back.example}</Text>
          <FlashcardEaseButtons
            cardNextIntervals={cardNextIntervals}
            handleNextFlashcard={handleNextFlashcard}
          />
        </>
      );
    }
  };

  if (loading) {
    return (
      <BackgroundView>
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" />
        </View>
      </BackgroundView>
    );
  }

  if (completed) {
    return (
      <BackgroundView>
        <ScrollView
          contentContainerStyle={tw`flex-1 justify-center items-center p-5`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text style={tw`text-xl mb-4 ${theme.classes.textPrimary}`}>You&apos;ve completed today&apos;s flashcards!</Text>
          <Text style={tw`text-lg mb-8 ${theme.classes.textPrimary}`}>Great job! Add some new words or review your readings to keep up the momentum.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Read' } }],
            })}
            style={tw`bg-purple-600`}
          >
            <Text style={tw`text-white text-base font-medium`}>Go to Readings</Text>
          </Button>
        </ScrollView>
      </BackgroundView>
    );
  }

  if (flashcards.length === 0) {
    return (
      <BackgroundView>
        <ScrollView
          contentContainerStyle={tw`flex-1 justify-center items-center p-5`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Text style={tw`text-xl mb-8 text-center px-4 ${theme.classes.textPrimary}`}>You haven&apos;t added any flashcards from your readings yet!</Text>
          <Button
            mode="contained"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Read' } }],
            })}
            style={tw`bg-purple-600`}
          >
            <Text style={tw`text-white`}>Go to Readings</Text>
          </Button>
        </ScrollView>
      </BackgroundView>
    );
  }

  return (
    <BackgroundView>
      <ScrollView
        contentContainerStyle={tw`flex-1 justify-center items-center p-5`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {currentFlashcard && (
          <TouchableOpacity onPress={handleFlipCard}>
            <PaperCard style={tw`mb-4 py-5 w-90 ${theme.classes.backgroundTertiary} border ${theme.classes.borderPrimary}`}>
              <PaperCard.Content>
                {renderCardContent()}
              </PaperCard.Content>
            </PaperCard>
          </TouchableOpacity>
        )}
        <HelperPopup 
          title="How to use"
          text="Tap the flashcard to reveal the other side."
          visible={frontCardHelperVisible}
          onClose={() => setFrontCardHelperVisible(false)}
        />
        <HelperPopup 
          title="Select difficulty"
          text="Select how easy you found the card. The difficulty you select will determine how frequently you will see the card."
          visible={backCardHelperVisible}
          onClose={() => setBackCardHelperVisible(false)}
        />
      </ScrollView>
    </BackgroundView>
  );
};

export default FlashcardsScreen;
