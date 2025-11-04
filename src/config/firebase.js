import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPi3amEokKuP9xPM7oM_cdP5bY-QExQgo",
  authDomain: "carrompool-adafc.firebaseapp.com",
  databaseURL: "https://carrompool-adafc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carrompool-adafc",
  storageBucket: "carrompool-adafc.firebasestorage.app",
  messagingSenderId: "1050088826550",
  appId: "1:1050088826550:web:047600433551e7da2d6817",
  measurementId: "G-DRF7M0PQ0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
