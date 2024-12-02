const {Model, DataTypes} = require('sequelize')
const sequelize = require('../db.config')
const Question = require('./question')

class soal extends Model {}

soal.init({
  soal: {
    type: DataTypes.STRING(4000),
    allowNull: false, 
  },
  pilihan_satu: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pilihan_dua: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pilihan_tiga: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pilihan_empat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  no_soal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jawaban: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
  page: {
    type: DataTypes.INTEGER, 
    allowNull: false, 
  },
  audio: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
  audio_question: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
  q_reading: {
    type: DataTypes.INTEGER,
    references: {
      model: 'questions',
      key: 'id'
    },
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'soal'
})

soal.belongsTo(Question, { foreignKey: 'q_reading', as: 'readingQuestion' });

module.exports = soal;