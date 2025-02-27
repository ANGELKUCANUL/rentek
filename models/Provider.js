const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Machinery = require('../models/Machinery'); // Importación correcta


const Provider = sequelize.define('Provider', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, // Agregar ID único
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false }, // Corregido a STRING
  rating: { type: DataTypes.FLOAT, defaultValue: 0.0 } // Corregido
});

module.exports = Provider;
