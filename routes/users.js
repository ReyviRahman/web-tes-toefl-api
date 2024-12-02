const express = require('express')
const csurf = require("csurf")
const csrfProtection = csurf({ cookie: { httpOnly: true } })
const router = express.Router()
const UsersModel = require('../models/users')
const upload = require('../middleware/upload')
const jwt = require('jsonwebtoken');

const secretKey = 'reyvisacd123';

router.get('/', async (req, res) => {
  const users = await UsersModel.findAll()

  res.status(200).json({
    data: users,
    metadata: "Get All User",
    cookieToken: `${req.cookies.cookieToken}`
  })
})

router.get('/lastScore', async (req,res) => {
  const { nohp } = req.query;
  console.log(nohp)
  const user = await UsersModel.findByPk(nohp);
  
  res.status(200).json({
    lastScore : user.lastScore,
    scoreListening : user.listening, 
    scoreWritten: user.written, 
    scoreReading: user.reading
  })
})



router.get('/getAuth', async (req, res) => {

  if (req.cookies.cookieToken) {
    const decoded = jwt.verify(req.cookies.cookieToken, secretKey);

    console.log('ini decoded', decoded)

    res.status(200).json({
      dataUser: {
        "nik" : decoded.nik,
        "nama" : decoded.nama,
        "profilePic" : decoded.profilePic,
        "role" : decoded.role
      },
      metadata: "Get Authentication",
      cookieToken: `${req.cookies.cookieToken}`
    })
  } else {
    res.status(200).json({
      dataUser: {
        "nik" : "",
        "nama": "",
        "profilePic" : "",
        "role" : ""
      },
      metadata: "Cookie is Empty",
    })
  }
  
})

router.get('/logout', async (req, res) => {
  res.clearCookie("cookieToken", { httpOnly: true, path: '/' });
  return res.status(200).json({ message: 'Logout berhasil' });
})

router.post('/', async (req, res) => {

  const { nik, nama, password } = req.body

  const users = await UsersModel.create({
    nik, nama, password
  })

  res.status(200).json({
    data: users,
    metadata: "test user endpoint"
  })
})

router.post('/tryagain', async (req,res) => {
  const { nohp } = req.body

  try {
    const user = await UsersModel.findByPk(nohp)
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan'})
    }

    await user.update({
      timeUjian: null,
      lastScore: -1
    })

    res.status(200).json({message: 'Ulang ujian berhasil'})
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error})
  }
})

router.put('/', async (req, res) => {

  const { nik, nama, password, passwordBaru } = req.body

  const userData = await UsersModel.findOne({ where: {nik: nik}})

  if (userData.password === password) {
    const users = await UsersModel.update({
      nama, password: passwordBaru
    }, {where: {nik: nik}})

    res.status(200).json({
      users,
      metadata: "user updated"
    })
  } else {
    res.status(400).json({
      error: "data invalid"
    })
  }
})

router.post('/login', async (req, res) => {
  const { nohp, password } = req.body;

  try {
    // Cari pengguna berdasarkan NIP
    const users = await UsersModel.findOne({ where: { nohp: nohp } });
    
    // Jika pengguna tidak ditemukan
    if (!users) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Jika password cocok
    if (users.password === password) {
      const token = jwt.sign(
        { nohp: users.nohp }, // Payload yang dikodekan dalam token
        secretKey, // Secret key untuk menandatangani token
        { expiresIn: '3h' } // Token akan kadaluarsa dalam 1 jam
      );

      res.cookie("cookieToken", jwt.sign({ nohp: users.nohp, nama: users.nama, role: users.role, profilePic: users.profilePic }, secretKey), { httpOnly: true, maxAge: 3 * 60 * 60 * 1000});

      return res.status(200).json({
        role: users.role,
        nama: users.nama,
        profilePic: users.profilePic,
        token,
        metadata: "Login success"
      });
    } else {
      // Jika password salah
      return res.status(401).json({
        error: "Invalid password"
      });
    }
  } catch (error) {
    console.error(error); // Menampilkan error di server
    res.status(500).json({
      error: "An internal server error occurred"
    });
  }
});

router.post('/register', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err });
    }

    const { nik, nama, ttl, jk, alamat, agama, statusPerkawinan, pekerjaan, email, password } = req.body;

    try {
      // Cek apakah user sudah ada
      const userExist = await UsersModel.findOne({ where: { nik }});
      if (userExist) {
        return res.status(400).json({ message: 'User Already Exist' });
      }

      // Buat user baru dengan path foto
      const newUser = await UsersModel.create({
        nik,
        nama,
        ttl, 
        jk, 
        alamat, 
        agama, 
        statusPerkawinan, 
        pekerjaan, 
        profilePic: req.file ? req.file.path : null,
        email,
        password,
        role: "User"
      });

      res.status(201).json({
        message: 'User Registered Successfully',
        user: newUser
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error
      });
    }
  });
});

router.get('/refreshtoken', async (req, res) => {
  const authHeader = req.headers.authorization; // Mengambil header Authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token is required' });
  }

  const token = authHeader.split(' ')[1]; // Mengambil token dari header

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, secretKey);

    // Cari pengguna berdasarkan nik
    const user = await UsersModel.findByPk(decoded.nik);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Buat token baru
    const newToken = jwt.sign(
      { nik: user.nik }, // Payload yang dikodekan dalam token
      secretKey, // Secret key untuk menandatangani token
      { expiresIn: '1h' } // Token akan kadaluarsa dalam 1 jam
    );

    return res.status(200).json({
      role: user.role,
      nik: user.nik,
      token: newToken,
      metadata: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;