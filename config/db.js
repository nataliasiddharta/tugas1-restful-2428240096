// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Terhubung ke host: ${conn.connection.host}`);
    console.log(`✅ Menggunakan Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Gagal koneksi ke database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;