const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Machinery = require('../models/Machinery');

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
 *               adress_entrega:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               machineryId:
 *                 type: string
 *                 format: uuid
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
    const { rental_start, rental_end, adress_entrega, userId, machineryId } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!rental_start || !rental_end || !adress_entrega || !userId || !machineryId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario y la maquinaria existen
    const user = await User.findByPk(userId);
    const machinery = await Machinery.findByPk(machineryId);

    if (!user || !machinery) {
      return res.status(400).json({ error: 'Usuario o maquinaria no encontrados' });
    }

    const newReservation = await Reservation.create({
      rental_start,
      rental_end,
      adress_entrega,
      userId,
      machineryId
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
 *               adress_entrega:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               machineryId:
 *                 type: string
 *                 format: uuid
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
    const { rental_start, rental_end, adress_entrega, userId, machineryId } = req.body;

    // Verificar si la reserva existe
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Actualizar los datos
    await reservation.update({ rental_start, rental_end, adress_entrega, userId, machineryId });

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

module.exports = router;
