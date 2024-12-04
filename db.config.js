require('dotenv').config();
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, 
  pool: { // Konfigurasi connection pooling
    max: 5,         // Maksimum koneksi dalam pool
    min: 0,         // Minimum koneksi dalam pool
    acquire: 30000, // Waktu tunggu maksimum untuk mencoba mendapatkan koneksi (ms)
    idle: 10000,    // Waktu idle sebelum koneksi dilepaskan (ms)
  },
  logging: false,    // Nonaktifkan logging SQL (opsional, gunakan jika Anda tidak butuh log query)
  dialectOptions: {  // Opsi tambahan untuk koneksi MySQL
    connectTimeout: 10000, // Waktu tunggu koneksi (ms)
  },
});


module.exports = sequelize