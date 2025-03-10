const express = require("express");
const axios = require("axios");
require("dotenv").config();


const router = express.Router();
const accessToken = process.env.MP_ACCESS_TOKEN;

router.post("/crear-preferencia", async (req, res) => {
    try {
        const { precio } = req.body;

        if (!precio || isNaN(precio) || precio <= 0) {
            return res.status(400).json({ message: "El precio debe ser un número válido mayor a 0" });
        }

        const preferencia = {
            items: [{ 
                title: "Renta de Equipo", 
                quantity: 1, 
                unit_price: parseFloat(precio), 
                currency_id: "MXN" 
            }],
            back_urls: {
                success: "https://rentek.onrender.com/api/pagos/success",
                failure: "https://rentek.onrender.com/api/pagos/failure",
                pending: "https://rentek.onrender.com/api/pagos/pending",
            },
            notification_url: "https://rentek.onrender.com/api/pagos/webhook",
            auto_return: "approved",
        };

        const response = await axios.post("https://api.mercadopago.com/checkout/preferences", preferencia, {
            headers: { 
                Authorization: `Bearer ${accessToken}`, 
                "Content-Type": "application/json" 
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: "Error al crear la preferencia",
            error: error.response?.data || error.message,
        });
    }
});

router.get("/success", async (req, res) => {
    try {
        const { payment_id, status, merchant_order_id } = req.query;
        
        // Verificar el estado del pago
        const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Aquí puedes guardar la información del pago en tu base de datos
        console.log("Pago exitoso:", {
            paymentId: payment_id,
            status: status,
            orderId: merchant_order_id,
            paymentDetails: paymentResponse.data
        });

        res.redirect('rentek://payment/success');
    } catch (error) {
        console.error("Error en success:", error);
        res.redirect('rentek://payment/error');
    }
});

router.get("/failure", (req, res) => {
    const { payment_id, status } = req.query;
    console.log("Pago fallido:", { paymentId: payment_id, status: status });
    res.redirect('rentek://payment/failure');
});

router.get("/pending", (req, res) => {
    const { payment_id, status } = req.query;
    console.log("Pago pendiente:", { paymentId: payment_id, status: status });
    res.redirect('rentek://payment/pending');
});

router.post("/webhook", async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === "payment") {
            const paymentId = data.id;
            
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const paymentStatus = response.data.status;
            const paymentDetail = response.data;

            // Aquí puedes implementar la lógica según el estado del pago
            switch (paymentStatus) {
                case "approved":
                    console.log("Pago aprobado:", paymentDetail);
                    // Implementar lógica para pago aprobado
                    break;
                case "rejected":
                    console.log("Pago rechazado:", paymentDetail);
                    // Implementar lógica para pago rechazado
                    break;
                case "pending":
                    console.log("Pago pendiente:", paymentDetail);
                    // Implementar lógica para pago pendiente
                    break;
                default:
                    console.log("Estado de pago no manejado:", paymentStatus);
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Error en webhook:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para verificar el estado de un pago específico
router.get("/verificar/:paymentId", async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            message: "Error al verificar el pago",
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
