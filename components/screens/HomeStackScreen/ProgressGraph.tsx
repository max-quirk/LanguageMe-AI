import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { View, Dimensions } from 'react-native';
import { Chart, Line, Area, HorizontalAxis, VerticalAxis } from 'react-native-responsive-linechart';

type TimePeriod = 'day' | 'week' | 'month';

interface ProgressData {
  learnt: Date[];
  revised: Date[];
}

const fetchProgressData = async (userId: string, period: TimePeriod): Promise<ProgressData> => {
  const userProgressCollectionRef = firestore().collection('users').doc(userId).collection('progress');
  const now = new Date();
  let periodStart: Date;

  switch (period) {
    case 'day':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'month':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const snapshot = await userProgressCollectionRef.where('date', '>=', periodStart).get();
  const progressData: ProgressData = { learnt: [], revised: [] };

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.type === 'learnt') {
      progressData.learnt.push(data.date.toDate());
    } else if (data.type === 'revised') {
      progressData.revised.push(data.date.toDate());
    }
  });

  return progressData;
};

export const ProgressGraph = ({ userId, period }: { userId: string, period: TimePeriod }) => {
  const [progressData, setProgressData] = React.useState<ProgressData>({ learnt: [], revised: [] });

  React.useEffect(() => {
    fetchProgressData(userId, period).then(data => setProgressData(data));
  }, [userId, period]);

  const learntData = progressData.learnt.map((date, index) => ({ x: index, y: index + 1 }));
  const revisedData = progressData.revised.map((date, index) => ({ x: index, y: index + 1 }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Chart
        style={{ height: 220, width: Dimensions.get('window').width - 20 }}
        data={learntData}
        padding={{ left: 40, bottom: 20, right: 20, top: 20 }}
        xDomain={{ min: 0, max: Math.max(learntData.length, revisedData.length) }}
        yDomain={{ min: 0, max: Math.max(learntData.length, revisedData.length) }}
      >
        <VerticalAxis tickCount={5} />
        <HorizontalAxis tickCount={5} />
        <Line data={learntData} smoothing="none" theme={{ stroke: { color: 'green', width: 2 } }} />
        <Line data={revisedData} smoothing="none" theme={{ stroke: { color: 'blue', width: 2 } }} />
        <Area data={learntData} theme={{ gradient: { from: { color: 'rgba(0, 128, 0, 0.2)' }, to: { color: 'rgba(0, 128, 0, 0)' } } }} />
        <Area data={revisedData} theme={{ gradient: { from: { color: 'rgba(0, 0, 255, 0.2)' }, to: { color: 'rgba(0, 0, 255, 0)' } } }} />
      </Chart>
    </View>
  );
};
