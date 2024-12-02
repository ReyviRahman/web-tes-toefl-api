// uploadConfig.js
const multer = require('multer');
const path = require('path');

// Konfigurasi storage untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder tujuan penyimpanan
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Inisialisasi `multer` dengan konfigurasi storage
const upload = multer({ storage: storage });

// Export `upload` untuk bisa digunakan di file lain
module.exports = upload;
