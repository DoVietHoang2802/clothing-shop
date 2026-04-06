import { auth } from '../config/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import api from './api';

const googleProvider = new GoogleAuthProvider();

// Configure Google sign-in to always show account chooser
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const googleToken = await user.getIdToken();

    // Verify token with backend and create session
    const response = await api.post('/auth/google', {
      googleToken,
    });

    if (response.data.success) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Force page reload to sync AuthContext
      setTimeout(() => {
        window.location.href = '/';
      }, 300);

      return response.data.data;
    }
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

export const googleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Google logout error:', error);
    throw error;
  }
};

export default {
  googleLogin,
  googleLogout,
};
