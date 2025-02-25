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
  userId: { // Clave foránea para User
    type: DataTypes.UUID, // Asegurar que es UUID si el id de User es UUID
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  machineryId: { // Clave foránea para Machinery
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Machinery,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
    allowNull: false,
    references: {
      model: Provider,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
});

// Definir relaciones correctamente
Reservation.belongsTo(User, { foreignKey: 'userId' });
Reservation.belongsTo(Machinery, { foreignKey: 'machineryId' });
Reservation.belongsTo(Provider, { foreignKey: 'provider_id' });

module.exports = Reservation;
