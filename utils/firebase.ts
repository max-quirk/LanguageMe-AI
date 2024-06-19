import { firebase } from '../config/firebase';

interface UserDoc {
  nativeLanguage?: string;
  targetLanguage?: string;
}

export const getUserDoc = async (userId: string): Promise<UserDoc | null> => {
  try {
    const userDoc = await firebase.firestore().collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data() as UserDoc;
    } else {
      console.error('User document does not exist.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user document:', error);
    throw error;
  }
};

export const getUserLanguageFromFirebase = async (userId: string): Promise<{ nativeLanguage: string; targetLanguage: string } | null> => {
  try {
    const userDoc = await getUserDoc(userId);
    if (userDoc) {
      const { nativeLanguage = '', targetLanguage = '' } = userDoc;
      return { nativeLanguage, targetLanguage };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user languages:', error);
    throw error;
  }
};

export const recordProgress = async ({
  userId,
  type
}: {
  userId: string, 
  type: 'learnt' | 'revised'
}) => {
  const userProgressCollectionRef = firebase.firestore().collection('users').doc(userId).collection('progress');
  const now = new Date();
  await userProgressCollectionRef.add({
    type,
    date: now,
  });
};

