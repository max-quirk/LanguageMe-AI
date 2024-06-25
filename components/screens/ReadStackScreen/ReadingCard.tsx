import React from 'react';
import { TouchableOpacity, Alert, Text } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { Reading } from '../../../types';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { deleteReading } from '../../../utils/readings';
import { firebase } from '../../../config/firebase';
import { ReadingsListScreenNavigationProp } from './ReadingsListScreen';

type ReadingCardProps = {
  reading: Reading;
  onDelete: (id: string) => void;
};

const ReadingCard: React.FC<ReadingCardProps> = ({ reading, onDelete }) => {
  const navigation = useNavigation<ReadingsListScreenNavigationProp>();

  const handleDelete = () => {
    const user = firebase.auth().currentUser;
    if (user) {
      deleteReading({ userId: user.uid, readingId: reading.id }).then(() => {
        onDelete(reading.id);
      });
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={tw`bg-red-500 justify-center p-4 mb-4 rounded-r-lg overflow-hidden`}
      onPress={() => {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this reading?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: handleDelete },
          ]
        );
      }}
    >
      <Text style={tw`text-white`}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity onPress={() => navigation.navigate('Reading', { reading })}>
        <Card style={tw`mb-4 bg-white shadow-lg rounded-lg`}>
          <Card.Content>
            <Title style={tw`text-lg font-bold text-gray-900`}>{reading.description}</Title>
            <Paragraph style={tw`text-gray-700`} numberOfLines={1} ellipsizeMode="tail">{reading.passage}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default ReadingCard;
