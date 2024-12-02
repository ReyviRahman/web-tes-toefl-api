const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db.config')

class question extends Model {}

question.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reading: {
    type: DataTypes.STRING(4000),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'question',
})

module.exports = question;