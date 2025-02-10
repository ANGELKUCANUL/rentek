const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('rentek', 'postgres', 'JOse12@@', {
  host: 'localhost', // Servidor local
  dialect: 'postgres',
  port: 5432, // Puerto de PostgreSQL
  logging: false, // Desactiva logs de SQL, opcional
});

module.exports = sequelize;
