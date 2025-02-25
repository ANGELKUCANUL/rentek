const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Machinery = require('../models/Machinery');
const qrcode = require('qrcode');

/**
 * @swagger
 * tags:
 *   - name: Reservations
 *     description: Operaciones relacionadas con las reservas
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Crear una nueva reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rental_start:
 *                 type: string
 *                 format: date-time
 *               rental_end:
 *                 type: string
 *                 format: date-time
 *               address_entrega:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               machineryId:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 *                 format: float
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, rechazado]
 *               delivery_status:
 *                 type: string
 *                 enum: [pendiente, en camino, entregado, cancelado]
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Datos inválidos o usuario/máquina no encontrados
 *       500:
 *         description: Error al crear la reserva
 */
router.post('/', async (req, res) => {
  try {
    const { rental_start, rental_end, address_entrega, userId, machineryId, price, payment_status, delivery_status } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!rental_start || !rental_end || !address_entrega || !userId || !machineryId || !price || !payment_status || !delivery_status) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario y la maquinaria existen
    const user = await User.findByPk(userId);
    const machinery = await Machinery.findByPk(machineryId);

    if (!user || !machinery) {
      return res.status(400).json({ error: 'Usuario o maquinaria no encontrados' });
    }

    // Obtener el provider_id de la maquinaria
    const provider_id = machinery.provider_id;

    // Crear la nueva reserva
    const newReservation = await Reservation.create({
      rental_start,
      rental_end,
      address_entrega,
      userId,
      machineryId,
      price,
      payment_status,
      delivery_status,
      provider_id  // Asignar provider_id de la maquinaria
    });

    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
  }
});

/**
 * @swagger
 * /reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Obtener todas las reservas
 *     responses:
 *       200:
 *         description: Lista de reservas
 *       500:
 *         description: Error al obtener las reservas
 */
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas', details: error.message });
  }
});

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     tags:
 *       - Reservations
 *     summary: Actualizar una reserva por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva a actualizar
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rental_start:
 *                 type: string
 *                 format: date-time
 *               rental_end:
 *                 type: string
 *                 format: date-time
 *               address_entrega:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               machineryId:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 *                 format: float
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, rechazado]
 *               delivery_status:
 *                 type: string
 *                 enum: [pendiente, en camino, entregado, cancelado]
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error al actualizar la reserva
 */
router.put('/:id', async (req, res) => {
  try {
    const { rental_start, rental_end, address_entrega, userId, machineryId, price, payment_status, delivery_status } = req.body;

    // Verificar si la reserva existe
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Actualizar los datos
    await reservation.update({
      rental_start,
      rental_end,
      address_entrega,
      userId,
      machineryId,
      price,
      payment_status,
      delivery_status
    });

    res.status(200).json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la reserva', details: error.message });
  }
});

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     tags:
 *       - Reservations
 *     summary: Eliminar una reserva por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva a eliminar
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error al eliminar la reserva
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.status(200).json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva', details: error.message });
  }
});

/**
 * @swagger
 * /reservations/{id}/qrcode:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Genera un código QR para una reserva
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Imagen del código QR en formato PNG
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error al generar el código QR
 */
const QRCode = require('qrcode');  // Importa la librería qrcode

router.get('/:id/qrcode', async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const qrText = `ID: ${reservation.id} | Total: $${reservation.price.toFixed(2)}`;

    // Genera el código QR como una imagen PNG
    QRCode.toBuffer(qrText, { type: 'png' }, (err, buffer) => {
      if (err) {
        return res.status(500).json({ error: 'Error al generar código QR', details: err.message });
      }

      res.set('Content-Type', 'image/png');
      res.send(buffer);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar código QR', details: error.message });
  }
});

module.exports = router;



