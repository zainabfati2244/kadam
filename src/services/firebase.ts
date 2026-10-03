import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile, User } from '@react-native-firebase/auth';
import { addDoc, collection, doc, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { getMessaging, getToken, requestPermission } from '@react-native-firebase/messaging';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export type AppUser = { uid: string; name: string; email: string; photo: string | null };

// The Android OAuth client ID is read from google-services.json by Firebase.
const webClientId = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
GoogleSignin.configure({ webClientId });

export const toAppUser = (user: User): AppUser => ({
  uid: user.uid, name: user.displayName || '', email: user.email || '', photo: user.photoURL,
});

export async function upsertUser(user: User) {
  const data = toAppUser(user);
  await setDoc(doc(getFirestore(), 'users', user.uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function signInWithGoogle() {
  if (webClientId.startsWith('YOUR_')) throw new Error('Google Sign-In needs a Web OAuth client ID. Enable Google provider in Firebase Authentication, create a Web OAuth client, then replace webClientId in src/services/firebase.ts.');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) throw new Error('Google Sign-In did not return an ID token. Add your Web client ID in src/services/firebase.ts.');
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(getAuth(), credential);
  await upsertUser(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getAuth(), email, password);
  await upsertUser(result.user);
  return result.user;
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const result = await createUserWithEmailAndPassword(getAuth(), email, password);
  if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });
  await upsertUser(getAuth().currentUser || result.user);
  return result.user;
}

export async function syncFcmToken(uid: string) {
  await requestPermission(getMessaging());
  const token = await getToken(getMessaging());
  await setDoc(doc(getFirestore(), 'users', uid), { fcmToken: token, updatedAt: serverTimestamp() }, { merge: true });
  return token;
}

export async function storeNotification(uid: string, notification: { title?: string; body?: string; messageId?: string }) {
  await addDoc(collection(getFirestore(), 'users', uid, 'notifications'), {
    title: notification.title || 'Kadam', body: notification.body || '', messageId: notification.messageId || null,
    read: false, createdAt: serverTimestamp(),
  });
}

export async function signOut() { await GoogleSignin.signOut(); await firebaseSignOut(getAuth()); }
