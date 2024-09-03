import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK (only once in your backend setup)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export async function getEmailsForUsers(userIds: string[]): Promise<Array<{ userId: string, email: string | null }>> {
  const users = await admin.auth().getUsers(
    userIds.map(userId => ({ uid: userId }))
  );

  return users.users.map((userRecord: admin.auth.UserRecord) => ({
    userId: userRecord.uid,
    email: userRecord.email || null
  }));
}
