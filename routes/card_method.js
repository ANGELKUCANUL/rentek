const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/card_method.js');

/**
 * @swagger
 * tags:
 *   name: PaymentMethods
 *   description: Endpoints para la gestión de métodos de pago con tarjeta
 */

/**
 * @swagger
 * /payment-methods:
 *   post:
 *     summary: Registrar un nuevo método de pago con tarjeta
 *     tags: [PaymentMethods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_holder
 *               - card_number
 *               - expiration_date
 *               - cvv
 *             properties:
 *               card_holder:
 *                 type: string
 *                 description: Nombre del titular de la tarjeta
 *               card_number:
 *                 type: string
 *                 description: Número de la tarjeta de crédito o débito
 *               expiration_date:
 *                 type: string
 *                 description: Fecha de vencimiento en formato MM/YY
 *               cvv:
 *                 type: string
 *                 description: Código de seguridad de la tarjeta
 *     responses:
 *       201:
 *         description: Método de pago creado exitosamente
 *       400:
 *         description: Error en la solicitud, faltan datos obligatorios
 *       500:
 *         description: Error del servidor al procesar la solicitud
 */
router.post('/', async (req, res) => {
  try {
    const { card_holder, card_number, expiration_date, cvv } = req.body;

    if (!card_holder || !card_number || !expiration_date || !cvv) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newPaymentMethod = await PaymentMethod.create({
      card_holder,
      card_number,
      expiration_date,
      cvv
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
 *     summary: Obtener la lista de métodos de pago registrados
 *     tags: [PaymentMethods]
 *     responses:
 *       200:
 *         description: Lista de métodos de pago obtenida exitosamente
 *       500:
 *         description: Error del servidor al procesar la solicitud
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
 *     summary: Actualizar un método de pago existente
 *     tags: [PaymentMethods]
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
 *     responses:
 *       200:
 *         description: Método de pago actualizado correctamente
 *       404:
 *         description: No se encontró el método de pago
 *       500:
 *         description: Error del servidor al procesar la solicitud
 */
router.put('/:id', async (req, res) => {
  try {
    const { card_holder, card_number, expiration_date, cvv } = req.body;

    const paymentMethod = await PaymentMethod.findByPk(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    await paymentMethod.update({
      card_holder,
      card_number,
      expiration_date,
      cvv
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
 *     summary: Eliminar un método de pago
 *     tags: [PaymentMethods]
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
 *         description: Método de pago eliminado correctamente
 *       404:
 *         description: No se encontró el método de pago
 *       500:
 *         description: Error del servidor al procesar la solicitud
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