const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Operaciones relacionadas con los pagos
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Realizar un pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               reservationId:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago realizado exitosamente
 *       500:
 *         description: Error al realizar el pago
 */
router.post('/', async (req, res) => {
  try {
    const { amount, reservationId, payment_method } = req.body;
    const newPayment = await Payment.create({ amount, reservationId, payment_method });
    res.status(200).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar el pago' });
  }
});

/**
 * @swagger
 * /payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Obtener todos los pagos
 *     responses:
 *       200:
 *         description: Lista de pagos
 *       500:
 *         description: Error al obtener los pagos
 */
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     tags:
 *       - Payments
 *     summary: Actualizar un pago por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pago a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *       404:
 *         description: Pago no encontrado
 *       500:
 *         description: Error al actualizar el pago
 */
router.put('/:id', async (req, res) => {
  try {
    const { amount, payment_method } = req.body;
    const updatedPayment = await Payment.update(
      { amount, payment_method },
      { where: { id: req.params.id } }
    );
    if (updatedPayment[0] === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.status(200).json({ message: 'Pago actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     tags:
 *       - Payments
 *     summary: Eliminar un pago por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del pago a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago eliminado exitosamente
 *       404:
 *         description: Pago no encontrado
 *       500:
 *         description: Error al eliminar el pago
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedPayment = await Payment.destroy({ where: { id: req.params.id } });
    if (deletedPayment === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.status(200).json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
});

module.exports = router;
