const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Pago por Tarjeta de Débito o Crédito
const PaymentMethod = sequelize.define('PaymentMethod', {
  card_holder: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  card_number: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    set(value) {
      // Aquí podrías encriptar el número de tarjeta antes de almacenarlo
      this.setDataValue('card_number', encryptCardNumber(value)); 
    }
  },
  expiration_date: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  cvv: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    set(value) {
      // También podrías encriptar el CVV antes de almacenarlo
      this.setDataValue('cvv', encryptCVV(value)); 
    }
  },
  payment_status: { 
    type: DataTypes.ENUM('pendiente', 'pagado', 'fallido'), 
    defaultValue: 'pendiente' 
  }
});

// Método para encriptar el número de tarjeta (solo un ejemplo, debes usar una librería segura como `crypto` o `bcrypt`)
function encryptCardNumber(cardNumber) {
  // Aquí utilizarías una librería de encriptación real para garantizar la seguridad
  return cardNumber.split('').reverse().join(''); // Solo como ejemplo
}

// Método para encriptar el CVV (igual, usar librerías seguras como bcrypt o crypto)
function encryptCVV(cvv) {
  return cvv.split('').reverse().join(''); // Solo como ejemplo
}

module.exports = PaymentMethod;
