// middlewares/uploadFiles.js
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: './uploads/syaratsurat', // Folder tempat menyimpan file
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Batas ukuran file dan filter untuk jenis file gambar
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Batas ukuran file 1MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf/; // Jenis file yang diperbolehkan
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!'); // Hanya menerima file gambar
    }
  }
}).fields([ // Menggunakan .fields() untuk menangani dua file
  { name: 'fileKTP', maxCount: 1 }, // Upload satu file untuk KTP
  { name: 'fileKK', maxCount: 1 }   // Upload satu file untuk KK
]);

// Middleware untuk mengupload file
const uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err }); // Kirim pesan error jika ada kesalahan
    }

    if (!req.files || !req.files['fileKTP'] || !req.files['fileKK']) {
      return res.status(400).json({ message: 'KTP dan KK harus diunggah' });
    }

    next(); // Lanjut ke middleware berikutnya
  });
};

module.exports = uploadFiles;
