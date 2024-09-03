import { firebase } from '../../config/firebase';

type ReadingsCount = {
  [userId: string]: number;
};

type ReadingsFrequency = {
  [readingCount: number]: number;
};

export async function readingsPerPerson(): Promise<ReadingsFrequency> {
  try {
    console.log('Calculating readings per person:');

    // Reference to the users collection
    const usersRef = firebase.firestore().collection('users');

    // Query to get all users
    const usersSnapshot = await usersRef.get();

    // Object to store total readings per user
    const readingsCountPerUser: ReadingsCount = {};

    // Object to store the frequency of readings per user count
    const readingsFrequency: ReadingsFrequency = {};

    // Loop through each user document
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Reference to the readings sub-collection for each user
      const readingsRef = userDoc.ref.collection('readings');

      // Get the total readings count for this user
      const readingsSnapshot = await readingsRef.get();
      const readingCount = readingsSnapshot.size;

      readingsCountPerUser[userId] = readingCount;

      // Increment the count of users with this reading count
      if (readingsFrequency[readingCount]) {
        readingsFrequency[readingCount]++;
      } else {
        readingsFrequency[readingCount] = 1;
      }
    }

    console.log('Readings frequency:', readingsFrequency);
    
    return readingsFrequency;

  } catch (error) {
    console.error('Error fetching readings per person:', error);
    return {}; // Return an empty object in case of error
  }
}
