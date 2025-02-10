const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const machineryRoutes = require('./routes/machinery');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const emailRoutes = require('./routes/email');
const providerRoutes = require('./routes/Provider');
const uploadRoutes = require('./routes/uploadRoutes');

// Configuración de Express
const app = express();
app.use(express.json());
app.use(cors());

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Renta de Maquinaria Pesada',
      version: '1.0.0',
      description: 'API para gestionar usuarios, maquinaria, reservas y pagos',
    },
  },
  apis: ['./routes/*.js', './server.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/users', userRoutes);
app.use('/machinery', machineryRoutes);
app.use('/reservations', reservationRoutes);
app.use('/payments', paymentRoutes);
app.use('/email', emailRoutes);
app.use('/providers', providerRoutes);
app.use('/api', uploadRoutes);

// Conectar a la base de datos (solo si lo necesitas)
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Conectado a la base de datos y tablas sincronizadas');
}).catch((error) => {
  console.error('❌ Error de conexión a la base de datos:', error);
});

// Exportar la función para Vercel
module.exports = (req, res) => {
  app(req, res);
};
