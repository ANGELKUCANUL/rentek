const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Reservation = require('./Reservation');

const Payment = sequelize.define('Payment', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
});

Payment.belongsTo(Reservation, { foreignKey: 'reservationId' });

module.exports = Payment;
