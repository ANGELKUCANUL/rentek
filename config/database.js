const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga variables de entorno desde .env

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Requerido por Render
      rejectUnauthorized: false // Evita problemas con certificados
    }
  },
  logging: false // Desactiva logs de SQL, opcional
});

module.exports = sequelize;
