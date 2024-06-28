import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { Reading, RootStackParamList } from '../../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import ReadingCard from './ReadingCard';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import Button from '../../Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reading', 'AddReading'>;

const ReadingsListScreen: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [helperVisible, setHelperVisible] = useState(false);
  const navigation = useNavigation<ReadingsListScreenNavigationProp>();

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReadings();
  };

  const handleDelete = (id: string) => {
    setReadings(prevReadings => prevReadings.filter(reading => reading.id !== id));
  };

  return (
    <View style={tw`flex-1 p-5 mt-20 bg-gray-100`}>
      <HelperPopup
        title="Getting Started"
        text="Welcome! Start by creating a reading passage on a topic you love. Tap on any word to view its definition and add it to your flashcards for easy review."
        visible={helperVisible}
        onClose={() => setHelperVisible(false)}
      />
      <Text style={tw`text-3xl mb-6 text-center font-bold text-gray-800`}>Readings</Text>
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
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {readings.map(reading => (
            <ReadingCard key={reading.id} reading={reading} onDelete={handleDelete} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ReadingsListScreen;
