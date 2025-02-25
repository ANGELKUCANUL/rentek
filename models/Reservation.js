const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Machinery = require('./Machinery');
const Provider = require('./Provider');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Genera un UUID automáticamente
    allowNull: false,
    primaryKey: true
  },
  rental_start: { type: DataTypes.DATE, allowNull: false },
  rental_end: { 
    type: DataTypes.DATE, 
    allowNull: false,
    validate: {
      isAfter(value) {
        if (new Date(value) <= new Date(this.rental_start)) {
          throw new Error("La fecha de finalización debe ser posterior a la de inicio.");
        }
      }
    }
  },
  address_entrega: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
  payment_status: { 
    type: DataTypes.ENUM('pendiente', 'pagado', 'rechazado'), 
    defaultValue: 'pendiente' 
  },
  delivery_status: { 
    type: DataTypes.ENUM('pendiente', 'en camino', 'entregado', 'cancelado'), 
    defaultValue: 'pendiente' 
  },
  provider_id: {  
    type: DataTypes.UUID,
    allowNull: false
  }
});

Reservation.belongsTo(User, { foreignKey: 'userId' });
Reservation.belongsTo(Machinery, { foreignKey: 'machineryId' });
Machinery.belongsTo(Provider, { foreignKey: 'provider_id' });

module.exports = Reservation;
