const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./Provider'); // Corregido el nombre del modelo

const Machinery = sequelize.define('Machinery', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  rental_price: { type: DataTypes.FLOAT, allowNull: false },
  image_code: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.BOOLEAN, allowNull: false }, // Corregido el nombre
  provider_id: { type: DataTypes.UUID, allowNull: false, references: { model: Provider, key: 'id' } } // Relación con Provider
});

// Definir la relación entre Machinery y Provider
Machinery.belongsTo(Provider, { foreignKey: 'provider_id' });
Provider.hasMany(Machinery, { foreignKey: 'provider_id' });

module.exports = Machinery;
