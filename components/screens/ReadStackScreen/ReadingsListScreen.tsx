import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { Reading, RootStackParamList } from '../../../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import ReadingCard from './components/ReadingCard';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import Button from '../../Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundView from '../../BackgroundView';
import { ScreenTitle } from '../../ScreenTitle';
import RefreshableScrollView from '../../RefreshableScrollView';

export type ReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reading', 'AddReading'>;

const ReadingsListScreen: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [helperVisible, setHelperVisible] = useState(false);
  const navigation = useNavigation<ReadingsListScreenNavigationProp>();
  const { theme } = useTheme();

  const fetchReadings = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      const readingsSnapshot = await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .collection('readings')
        .orderBy('createdAt', 'desc')
        .get();
      setReadings(readingsSnapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: doc.id,
        description: doc.data().description,
        difficulty: doc.data().difficulty,
        wordCount: doc.data().wordCount,
        passage: doc.data().passage,
        createdAt: doc.data().createdAt.toDate(),
        wordTimestamps: doc.data().wordTimestamps,
      } as Reading)));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const initialize = async () => {
      const firstTimeUser = await isFirstTimeUser();
      if (firstTimeUser) {
        setTimeout(() => {
          setHelperVisible(true);
        }, 1000);
      }
      fetchReadings();
    };
    initialize();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchReadings();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReadings();
  };

  const handleDelete = (id: string) => {
    setReadings(prevReadings => prevReadings.filter(reading => reading.id !== id));
  };

  return (
    <BackgroundView>
      <View style={tw`flex-1 px-5 mt-20 ${theme.classes.backgroundPrimary}`}>
        <HelperPopup
          title="Getting Started"
          text="Welcome! Start by creating a reading passage on a topic you love. Tap on any word to view its definition and add it to your flashcards for easy review."
          visible={helperVisible}
          onClose={() => setHelperVisible(false)}
        />
        <ScreenTitle title='Readings' />
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddReading')}
          style={tw`mb-6 bg-purple-600 h-14`}
          contentStyle={tw`h-14`}
        >
          <View style={tw`flex flex-row gap-2 pt-1 items-center`}>
            <Icon name="plus" size={28} color="white"/>
            <Text style={tw`text-lg text-white font-bold`}>Generate Reading</Text>
          </View>
        </Button>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <RefreshableScrollView
            refreshing={refreshing}
            onRefresh={handleRefresh}
          >
            {readings.map(reading => (
              <ReadingCard key={reading.id} reading={reading} onDelete={handleDelete} />
            ))}
          </RefreshableScrollView>
        )}
      </View>
    </BackgroundView>
  );
};

export default ReadingsListScreen;
