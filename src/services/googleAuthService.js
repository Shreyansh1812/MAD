import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const isNativePlatform = () => Capacitor.isNativePlatform();

const isUserCancellationError = (error) => {
  const code = (error?.code || '').toString().toLowerCase();
  const message = (error?.message || '').toString().toLowerCase();
  return (
    code.includes('cancel') ||
    code.includes('closed') ||
    code.includes('dismiss') ||
    message.includes('cancel') ||
    message.includes('closed') ||
    message.includes('dismiss')
  );
};

export const signInWithGoogleCrossPlatform = async () => {
  if (!isNativePlatform()) {
    return signInWithPopup(auth, googleProvider);
  }

  const nativeResult = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true,
  });

  const idToken = nativeResult?.credential?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};

export const getGoogleSignInErrorMessage = (error) => {
  if (isUserCancellationError(error)) {
    return 'Sign-in cancelled';
  }

  if (error?.code === 'auth/popup-blocked') {
    return 'Popup blocked. Please allow popups and try again';
  }

  if (error?.message?.includes('google-services.json')) {
    return 'Google Sign-In is not configured for Android yet. Add google-services.json and try again.';
  }

  return 'Google Sign-In failed. Please try again.';
};
