const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/card_method.js');
const bwipjs = require('bwip-js'); // Librería para generar código de barras


/**
 * @swagger
 * tags:
 *   - name: PaymentMethods
 *     description: Operaciones relacionadas con los métodos de pago
 */

/**
 * @swagger
 * /payment-methods:
 *   post:
 *     tags:
 *       - PaymentMethods
 *     summary: Crear un nuevo método de pago con tarjeta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_holder:
 *                 type: string
 *               card_number:
 *                 type: string
 *               expiration_date:
 *                 type: string
 *               cvv:
 *                 type: string
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, fallido]
 *     responses:
 *       201:
 *         description: Método de pago creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error al crear el método de pago
 */
router.post('/', async (req, res) => {
  try {
    const { card_holder, card_number, expiration_date, cvv, payment_status } = req.body;

    if (!card_holder || !card_number || !expiration_date || !cvv || !payment_status) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newPaymentMethod = await PaymentMethod.create({
      card_holder,
      card_number,
      expiration_date,
      cvv,
      payment_status
    });

    res.status(201).json(newPaymentMethod);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el método de pago', details: error.message });
  }
});

/**
 * @swagger
 * /payment-methods:
 *   get:
 *     tags:
 *       - PaymentMethods
 *     summary: Obtener todos los métodos de pago
 *     responses:
 *       200:
 *         description: Lista de métodos de pago
 *       500:
 *         description: Error al obtener los métodos de pago
 */
router.get('/', async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findAll();
    res.status(200).json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los métodos de pago', details: error.message });
  }
});

/**
 * @swagger
 * /payment-methods/{id}:
 *   put:
 *     tags:
 *       - PaymentMethods
 *     summary: Actualizar un método de pago por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del método de pago a actualizar
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
 *               card_holder:
 *                 type: string
 *               card_number:
 *                 type: string
 *               expiration_date:
 *                 type: string
 *               cvv:
 *                 type: string
 *               payment_status:
 *                 type: string
 *                 enum: [pendiente, pagado, fallido]
 *     responses:
 *       200:
 *         description: Método de pago actualizado exitosamente
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error al actualizar el método de pago
 */
router.put('/:id', async (req, res) => {
  try {
    const { card_holder, card_number, expiration_date, cvv, payment_status } = req.body;

    const paymentMethod = await PaymentMethod.findByPk(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    await paymentMethod.update({
      card_holder,
      card_number,
      expiration_date,
      cvv,
      payment_status
    });

    res.status(200).json({ message: 'Método de pago actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el método de pago', details: error.message });
  }
});

/**
 * @swagger
 * /payment-methods/{id}:
 *   delete:
 *     tags:
 *       - PaymentMethods
 *     summary: Eliminar un método de pago por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del método de pago a eliminar
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Método de pago eliminado exitosamente
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error al eliminar el método de pago
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PaymentMethod.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    res.status(200).json({ message: 'Método de pago eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el método de pago', details: error.message });
  }
});


module.exports = router;
