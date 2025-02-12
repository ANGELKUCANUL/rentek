const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Machinery = require('../models/Machinery');
const Provider = require('../models/Provider'); // Importamos el modelo de Provider

/**
 * @swagger
 * tags:
 *   - name: Machinery
 *     description: Operaciones relacionadas con la maquinaria
 */

/**
 * @swagger
 * /machinery:
 *   post:
 *     tags:
 *       - Machinery
 *     summary: Crear nueva maquinaria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               rental_price:
 *                 type: number
 *               image_code:
 *                 type: string
 *               state:
 *                 type: boolean
 *               provider_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Maquinaria creada exitosamente
 *       400:
 *         description: Datos inválidos o proveedor no encontrado
 *       500:
 *         description: Error al crear la maquinaria
 */
router.post('/', async (req, res) => {
  try {
    const { name, location, description, rental_price, image_code, state, provider_id } = req.body;
    
    if (!name || !location || !rental_price || !provider_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el provider_id existe en la base de datos
    const providerExists = await Provider.findByPk(provider_id);
    if (!providerExists) {
      return res.status(400).json({ error: 'El proveedor especificado no existe' });
    }

    const newMachinery = await Machinery.create({ 
      name, location, description, rental_price, image_code, state, provider_id 
    });

    res.status(201).json(newMachinery);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear maquinaria', details: error.message });
  }
});

/**
 * @swagger
 * /machinery:
 *   get:
 *     tags:
 *       - Machinery
 *     summary: Obtener todas las maquinarias
 *     responses:
 *       200:
 *         description: Lista de maquinarias
 *       500:
 *         description: Error al obtener maquinarias
 */
router.get('/', async (req, res) => {
  try {
    const machinery = await Machinery.findAll();
    res.status(200).json(machinery);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener maquinarias', details: error.message });
  }
});

/**
 * @swagger
 * /machinery/{id}:
 *   put:
 *     tags:
 *       - Machinery
 *     summary: Actualizar maquinaria por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquinaria a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               rental_price:
 *                 type: number
 *               image_code:
 *                 type: string
 *               state:
 *                 type: boolean
 *               provider_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Maquinaria actualizada exitosamente
 *       400:
 *         description: Datos inválidos o proveedor no encontrado
 *       404:
 *         description: Maquinaria no encontrada
 *       500:
 *         description: Error al actualizar maquinaria
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, location, description, rental_price, image_code, state, provider_id } = req.body;
    
    if (provider_id) {
      // Verificar si el nuevo provider_id existe en la base de datos
      const providerExists = await Provider.findByPk(provider_id);
      if (!providerExists) {
        return res.status(400).json({ error: 'El proveedor especificado no existe' });
      }
    }

    const [updated] = await Machinery.update(
      { name, location, description, rental_price, image_code, state, provider_id },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Maquinaria no encontrada' });
    }

    res.status(200).json({ message: 'Maquinaria actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar maquinaria', details: error.message });
  }
});

/**
 * @swagger
 * /machinery/{id}:
 *   delete:
 *     tags:
 *       - Machinery
 *     summary: Eliminar maquinaria por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la maquinaria a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maquinaria eliminada exitosamente
 *       404:
 *         description: Maquinaria no encontrada
 *       500:
 *         description: Error al eliminar maquinaria
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Machinery.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Maquinaria no encontrada' });
    }

    res.status(200).json({ message: 'Maquinaria eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar maquinaria', details: error.message });
  }
});

module.exports = router;
