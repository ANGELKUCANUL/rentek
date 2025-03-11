const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const accessToken = process.env.MP_ACCESS_TOKEN; // Usar variable de entorno

router.post("/crear-preferencia", async (req, res) => {
    try {
        const { precio } = req.body;

        if (!precio || isNaN(precio) || precio <= 0) {
            return res.status(400).json({ message: "El precio debe ser un número válido mayor a 0" });
        }

        const preferencia = {
            items: [{ 
                title: "Producto de Prueba", 
                quantity: 1, 
                unit_price: parseFloat(precio), 
                currency_id: "MXN" 
            }],
            back_urls: {
                success: "miapp://success",
                failure: "miapp://failure",
                pending: "miapp://pending"
            },
            auto_return: "approved",
        };
        

        const response = await axios.post("https://api.mercadopago.com/checkout/preferences", preferencia, {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: "Error al crear la preferencia",
            error: error.response?.data || error.message,
        });
    }
});

module.exports = router;
