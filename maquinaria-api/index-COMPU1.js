const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const machineryRoutes = require('./routes/machinery');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
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
  apis: ['./routes/*.js'], // Path de las rutas con documentación
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/users', userRoutes);
app.use('/machinery', machineryRoutes);
app.use('/reservations', reservationRoutes);
app.use('/payments', paymentRoutes);

// Conectar a la base de datos
sequelize.sync().then(() => {
  console.log('Conectado a la base de datos y tablas sincronizadas');
}).catch((error) => {
  console.error('Error de conexión a la base de datos', error);
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});

