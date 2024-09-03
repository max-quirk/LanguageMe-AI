import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { firebase } from '../../config/firebase';

type TopUsers = Array<{ userId: string, readingsCount: number }>;

export async function top10UsersByReadings(): Promise<TopUsers> {
  try {
    console.log('Fetching top 10 users by readings:');

    // Reference to the users collection
    const usersRef = firebase.firestore().collection('users');

    // Query to get all users
    const usersSnapshot = await usersRef.get();

    // Array to store user data with reading counts
    const usersData: TopUsers = [];

    // Loop through each user document
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Reference to the readings sub-collection for each user
      const readingsRef = userDoc.ref.collection('readings');

      // Get the total readings count for this user
      const readingsSnapshot = await readingsRef.get();
      const readingsCount = readingsSnapshot.size;

      usersData.push({ userId, readingsCount });
    }

    // Sort the users by readings count in descending order
    usersData.sort((a, b) => b.readingsCount - a.readingsCount);

    // Get the top 10 users
    const top10Users = usersData.slice(0, 10);

    console.log('Top 10 users by readings:', top10Users);

    return top10Users;

  } catch (error) {
    console.error('Error fetching top 10 users by readings:', error);
    return []; // Return an empty array in case of error
  }
}
