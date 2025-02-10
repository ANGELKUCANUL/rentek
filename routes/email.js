const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

/**
 * @swagger
 * /email/send-email:
 *   post:
 *     tags:
 *       - gmail
 *     summary: Envía un correo de confirmación de reserva
 *     description: Envía un correo electrónico con la información de la reserva.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@gmail.com"
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               amount:
 *                 type: number
 *                 example: 150.00
 *               delivery_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-10"
 *               machinery_name:
 *                 type: string
 *                 example: "Excavadora CAT 320"
 *               machinery_details:
 *                 type: string
 *                 example: "Excavadora hidráulica con capacidad de 20 toneladas"
 *               rental_days:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Correo enviado exitosamente
 *       400:
 *         description: Faltan datos en la solicitud
 *       500:
 *         description: Error al enviar el correo
 */

router.post('/send-email', async (req, res) => {
    console.log("Datos recibidos:", req.body);  // 👀 Log para depuración

    const { email, name, amount, delivery_date, machinery_name, machinery_details, rental_days } = req.body;

    if (!email || !name || !amount || !delivery_date || !machinery_name || !machinery_details || !rental_days) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud' });
    }

    // Configuración del transporte con Gmail (Usar variables de entorno para mayor seguridad)
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "rentadora.de.maquinaria.pesada@gmail.com",
            pass: "gjiv txlv suul lozb" // Usa variables de entorno
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmación de Reserva',
        html: `
            <h2>Confirmación de Reserva</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu reserva ha sido confirmada con éxito. Aquí están los detalles:</p>
            <ul>
                <li><strong>Monto Total:</strong> $${amount.toFixed(2)}</li>
                <li><strong>Día de Entrega:</strong> ${delivery_date}</li>
                <li><strong>Máquina:</strong> ${machinery_name}</li>
                <li><strong>Detalles:</strong> ${machinery_details}</li>
                <li><strong>Días de Renta:</strong> ${rental_days} días</li>
            </ul>
            <p>Gracias por elegir nuestro servicio.</p>
            <p><strong>Atentamente,</strong><br>Rentek</p>
        `,
    }; 

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado a:', email);
        res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error);
        res.status(500).json({ message: 'Error al enviar el correo', details: error.message });
    }
});

module.exports = router;
