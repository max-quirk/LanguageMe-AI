import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import tw from 'twrnc';
import { firebase } from '@react-native-firebase/auth';
import { ProgressGraph } from './ProgressGraph';

const TimePeriodSelector = ({ setPeriod }: { setPeriod: React.Dispatch<React.SetStateAction<"day" | "week" | "month">>}) => {
  return (
    <View>
      <Button onPress={() => setPeriod('day')}>Day</Button>
      <Button onPress={() => setPeriod('week')}>Week</Button>
      <Button onPress={() => setPeriod('month')}>Month</Button>
    </View>
  );
};

// Use it in your home screen component
const HomeScreen: React.FC = () => {
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month'>('day');
  const user = firebase.auth().currentUser
  if (!user) {
    return <ActivityIndicator size='large' />;
  }
  return (
    <View style={tw`flex-1 flex-row`}>
      <TimePeriodSelector setPeriod={setPeriod} />
      {/* <ProgressGraph userId={user.uid} period={period} /> */}
    </View>
  );
};

export default HomeScreen
