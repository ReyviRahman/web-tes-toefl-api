const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db.config');

class user extends Model {}

user.init({
  nohp: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  nama: {
    type: DataTypes.STRING
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING
  },
  timeUjian: {
    type: DataTypes.TIME,
    allowNull: true
  },
  lastScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  listening: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  written: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reading: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
}, {
  sequelize,
  modelName: 'users',
});

module.exports = user;
