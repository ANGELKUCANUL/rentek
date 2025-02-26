const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Genera automáticamente un UUID
    primaryKey: true,
  },
  card_holder: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  card_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiration_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cvv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID, // Cambiar de INTEGER a UUID
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'payment_methods',
  timestamps: false,
});

PaymentMethod.belongsTo(User, { foreignKey: 'userId' });

module.exports = PaymentMethod;
