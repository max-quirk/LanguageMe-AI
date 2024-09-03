import { firebase } from '../../config/firebase';
import { FROM_DATE } from './runAnalytics';

export async function readingsByDifficulty() {
  try {
    console.log('readings by difficulty analytics:');

    // Reference to the readings collection (assuming it's a sub-collection under users)
    const readingsRef = firebase.firestore().collectionGroup('readings');

    const readingsSnapshot = await readingsRef
    .where('createdAt', '>', FROM_DATE)
    .orderBy('createdAt', 'asc') 
    .orderBy('difficulty', 'asc')
    .get();    

    const totalReadings = readingsSnapshot.size;
    console.log(`Total readings: ${totalReadings}`);

    // Count for each difficulty level
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    readingsSnapshot.forEach(doc => {
      const data = doc.data();
      const difficulty = data.difficulty;

      if (difficulty === 'easy') {
        easyCount++;
      } else if (difficulty === 'medium') {
        mediumCount++;
      } else if (difficulty === 'hard') {
        hardCount++;
      }
    });

    // Calculate percentages
    const easyPercentage = ((easyCount / totalReadings) * 100).toFixed(2);
    const mediumPercentage = ((mediumCount / totalReadings) * 100).toFixed(2);
    const hardPercentage = ((hardCount / totalReadings) * 100).toFixed(2);

    // Log the results
    console.log(`Easy: ${easyPercentage}% (${easyCount} readings)`);
    console.log(`Medium: ${mediumPercentage}% (${mediumCount} readings)`);
    console.log(`Hard: ${hardPercentage}% (${hardCount} readings)\n\n`);

  } catch (error) {
    console.error('Error fetching readings by difficulty:', error);
  }
}
