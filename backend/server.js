require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/connectDB');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 5000;

// Khởi tạo Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase Admin SDK initialized');
} catch (error) {
  console.log('Firebase Admin SDK not initialized:', error.message);
}

// Kết nối database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
