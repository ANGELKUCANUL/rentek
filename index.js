const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const machineryRoutes = require('./routes/machinery');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const emailRoutes = require('./routes/email');
const providerRoutes = require('./routes/Provider');
const uploadRoutes = require('./routes/uploadRoutes');
const card_method = require('./routes/card_method');

// Nombre en minúsculas
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Renta de Maquinaria Pesada',
      version: '1.0.0',
      description: 'API para gestionar usuarios, maquinaria, reservas y pagos',
    },
  },
  apis: ['./routes/*.js', './server.js'], // Asegúrate de incluir el archivo correcto
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/users', userRoutes);
app.use('/machinery', machineryRoutes);
app.use('/reservations', reservationRoutes);
app.use('/payments', paymentRoutes);
app.use('/email', emailRoutes);
app.use('/providers', providerRoutes); // Nombre en plural y en minúsculas
app.use('/api', uploadRoutes);
app.use('/payment-methods',card_method);

// Conectar a la base de datos
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Conectado a la base de datos y tablas sincronizadas');
}).catch((error) => {
  console.error('❌ Error de conexión a la base de datos:', error);
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📄 Documentación Swagger en http://localhost:${PORT}/api-docs`);
});
