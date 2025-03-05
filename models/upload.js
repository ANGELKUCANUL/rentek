const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Machinery = sequelize.define('upload', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_maquina: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Machinery;
