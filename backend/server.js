require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/connectDB');
const admin = require('firebase-admin');
const http = require('http');
const socketConfig = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Khởi tạo Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK initialized");
} catch (error) {
  console.log("⚠️ Firebase Admin SDK not initialized:", error.message);
}

// Kết nối database
connectDB();

// Tạo HTTP server và khởi tạo Socket.io
const server = http.createServer(app);
const io = socketConfig.init(server);

// Lưu io vào app để có thể truy cập từ controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`🔌 Socket.io đã được kích hoạt`);
});
