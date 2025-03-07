require('dotenv').config(); // Carga variables de entorno desde .env
const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

console.log("Mercado Pago configurado correctamente");
