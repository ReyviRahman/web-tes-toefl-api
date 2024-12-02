const express = require('express')
const router = express.Router()
const SoalModel = require('../models/soal')
const UserModel = require('../models/users')
const Question = require('../models/question')

router.get('/', async (req, res) => {
  const soal = await SoalModel.findAll({
    attributes: {
      exclude: ['jawaban', 'createdAt', 'updatedAt', 'q_reading', 'no_soal'], 
    },
    include: {
      model: Question,
      as: 'readingQuestion',
      attributes: ['reading']
    }
  })

  res.status(200).json({
    soal: soal,
    metadata: "Get All Soal"
  })
})

router.put('/timers', async (req, res) => {
  const { nohp, timeUjian } = req.body;
  const user = await UserModel.findByPk(nohp);
  if (user.timeUjian === null) {
    await user.update({ timeUjian });
    return res.status(200).json({
      message: "timeUjian updated successfully",
      timeUjian: timeUjian,
    });
  }

  res.status(200).json({
    message: "timeUjian already set, no update performed",
    timeUjian: user.timeUjian,
  });
})

router.get('/getsoal', async (req, res) => {
  const { page } = req.query; // Mengambil parameter 'page'

  if (!page) {
    return res.status(400).json({ message: 'Page query parameter is required.' });
  }

  try {
    // Fetch soal berdasarkan page (hanya satu page)
    const soalPage = await SoalModel.findOne({
      where: { page: page },
    });

    if (!soalPage) {
      return res.status(404).json({ message: `No questions found for page ${page}` });
    }

    res.status(200).json({ soal: soalPage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the question.', error: error.message });
  }
});

router.post('/jawaban', async (req, res) => {
  const listeningMap = {
    0: 24,
    1: 25,
    2: 26,
    3: 27,
    4: 28,
    5: 29,
    6: 30,
    7: 31,
    8: 32,
    9: 32,
    10: 33,
    11: 35,
    12: 37,
    13: 38,
    14: 39,
    15: 41,
    16: 41,
    17: 42,
    18: 43,
    19: 44,
    20: 45,
    21: 45,
    22: 46,
    23: 47,
    24: 47,
    25: 48,
    26: 48,
    27: 49,
    28: 49,
    29: 50,
    30: 51,
    31: 51,
    32: 52,
    33: 52,
    34: 53,
    35: 54,
    36: 54,
    37: 55,
    38: 56,
    39: 57,
    40: 57,
    41: 58,
    42: 59,
    43: 60,
    44: 61,
    45: 62,
    46: 63,
    47: 65,
    48: 66,
    49: 67,
    50: 68
  };
  
  const writtenMap = {
    0: 20,
    1: 20,
    2: 21,
    3: 22,
    4: 23,
    5: 25,
    6: 26,
    7: 27,
    8: 29,
    9: 31,
    10: 33,
    11: 35,
    12: 36,
    13: 37,
    14: 38,
    15: 40,
    16: 40,
    17: 41,
    18: 42,
    19: 43,
    20: 44,
    21: 45,
    22: 46,
    23: 47,
    24: 48,
    25: 49,
    26: 50,
    27: 51,
    28: 52,
    29: 53,
    30: 54,
    31: 55,
    32: 56,
    33: 57,
    34: 58,
    35: 60,
    36: 61,
    37: 63,
    38: 65,
    39: 67,
    40: 68,
  };
  
  const readingMap = {
    0: 21,
    1: 22,
    2: 23,
    3: 23,
    4: 24,
    5: 25,
    6: 26,
    7: 27,
    8: 28,
    9: 28,
    10: 29,
    11: 30,
    12: 31,
    13: 32,
    14: 34,
    15: 35,
    16: 36,
    17: 37,
    18: 38,
    19: 39,
    20: 40,
    21: 41,
    22: 42,
    23: 43,
    24: 43,
    25: 44,
    26: 45,
    27: 46,
    28: 46,
    29: 47,
    30: 48,
    31: 48,
    32: 49,
    33: 50,
    34: 51,
    35: 52,
    36: 52,
    37: 53,
    38: 54,
    39: 54,
    40: 55,
    41: 56,
    42: 57,
    43: 58,
    44: 59,
    45: 60,
    46: 61,
    47: 63,
    48: 65,
    49: 66,
    50: 67,
  };

  try {
    const { nohp, answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const user = await UserModel.findByPk(nohp)
    if (user.lastScore !== -1) {
      return res.status(200).json({ toeflScore : user.lastScore, scoreListening : user.listening, scoreWritten: user.written, scoreReading: user.reading})
    }

    // Ambil hanya kolom 'page' dan 'jawaban' dari semua soal
    const allSoal = await SoalModel.findAll({
      attributes: ['page', 'jawaban'], // Kolom yang diambil
    });

    let totalPoints = 0;
    let listeningCorrect = 0;
    let writtenCorrect = 0;
    let readingCorrect = 0;
    const processedIds = new Set(); // Untuk melacak id yang sudah diproses

    // Loop melalui jawaban user dan bandingkan dengan soal
    for (const userAnswer of answers) {
      const { id, answer } = userAnswer;

      // Lewati jika id sudah diproses sebelumnya
      if (processedIds.has(id)) {
        continue;
      }

      // Tandai id sebagai sudah diproses
      processedIds.add(id);

      // Cari soal di memori berdasarkan id
      const soal = allSoal.find((q) => q.page === id);

      // Cocokkan jawaban user dengan jawaban di database
      if (soal && soal.jawaban === answer) {
        if (id >= 1 && id <= 50) {
          listeningCorrect += 1;
        } else if (id >= 52 && id <= 92) {
          writtenCorrect += 1;
        } else if (id >= 94 && id <= 143) {
          readingCorrect += 1;
        }
        totalPoints += 1; // Tambah poin jika jawaban benar
      }
    }

    let scoreListening = listeningMap[listeningCorrect]
    let scoreWritten = writtenMap[writtenCorrect]
    let scoreReading = readingMap[readingCorrect]
    let toeflScore = Math.round((scoreListening + scoreWritten + scoreReading) / 3 * 10) 

    await user.update({ lastScore: toeflScore, listening: scoreListening, written: scoreWritten, reading: scoreReading })

    // Kirimkan total poin user
    res.status(200).json({ toeflScore, scoreListening, scoreWritten, scoreReading });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router