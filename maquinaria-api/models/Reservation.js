const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Machinery = require('./Machinery');
const Provider = require('./Provider'); // Corregido el nombre del modelo

const Reservation = sequelize.define('Reservation', {
  rental_start: { type: DataTypes.DATE, allowNull: false },
  rental_end: { type: DataTypes.DATE, allowNull: false },
  adress_entrega: { type: DataTypes.STRING, allowNull: false } // Corregido
});

Reservation.belongsTo(User, { foreignKey: 'userId' });
Reservation.belongsTo(Machinery, { foreignKey: 'machineryId' });
Machinery.belongsTo(Provider, { foreignKey: 'provider_id' });

module.exports = Reservation;
