const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if we have Firebase credentials as JSON string in environment
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    console.warn('Firebase Admin SDK will not be initialized');
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Alternative: read from file path
  try {
    serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
  } catch (error) {
    console.error('Error loading Firebase service account file:', error);
    console.warn('Firebase Admin SDK will not be initialized');
  }
}

// Initialize Firebase Admin SDK if credentials are available
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');
} else {
  console.warn('Firebase Admin SDK not initialized - no credentials found');
}

module.exports = admin;
