require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/connectDB');

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
