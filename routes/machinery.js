const express = require('express');
const router = express.Router();
const Machinery = require('../models/Machinery');
const Provider = require('../models/Provider');

/**
 * @swagger
 * tags:
 *   - name: Machinery
 *     description: Operaciones relacionadas con la maquinaria
 */

// ==========================
// 🔹 GET: Obtener maquinarias
// ==========================
/**
 * @swagger
 * /machinery:
 *   get:
 *     tags:
 *       - Machinery
 *     summary: Obtener todas las maquinarias
 *     responses:
 *       200: { description: Lista de maquinarias }
 *       500: { description: Error al obtener maquinarias }
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
 * /machinery/by-provider/{provider_id}:
 *   get:
 *     tags:
 *       - Machinery
 *     summary: Obtener maquinarias por proveedor
 *     parameters:
 *       - in: path
 *         name: provider_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proveedor
 *     responses:
 *       200: { description: Lista de maquinarias del proveedor }
 *       400: { description: ID de proveedor inválido }
 *       404: { description: No se encontraron maquinarias para el proveedor }
 *       500: { description: Error al obtener maquinarias }
 */
router.get('/by-provider/:provider_id', async (req, res) => {
  try {
    const { provider_id } = req.params;

    if (!provider_id) {
      return res.status(400).json({ error: 'Debe proporcionar un ID de proveedor' });
    }

    const providerExists = await Provider.findByPk(provider_id);
    if (!providerExists) {
      return res.status(404).json({ error: `Proveedor con ID ${provider_id} no encontrado` });
    }

    const machinery = await Machinery.findAll({ where: { provider_id } });

    if (machinery.length === 0) {
      return res.status(404).json({ message: 'No se encontraron maquinarias para este proveedor' });
    }

    res.status(200).json(machinery);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener maquinarias', details: error.message });
  }
});
/**
 * @swagger
 * /machinery/with-provider:
 *   get:
 *     tags:
 *       - Machinery
 *     summary: Obtener todas las maquinarias junto con su proveedor
 *     responses:
 *       200: { description: Lista de maquinarias con su proveedor }
 *       500: { description: Error al obtener maquinarias }
 */
router.get('/with-provider', async (req, res) => {
  try {
    const machinery = await Machinery.findAll({
      include: [{ model: Provider, attributes: ['id', 'name', 'email', 'phoneNumber', 'rating'] }]
    });
    res.status(200).json(machinery);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener maquinarias', details: error.message });
  }
});

// ==========================
// 🔹 POST: Crear maquinarias
// ==========================
/**
 * @swagger
 * /machinery/bulk:
 *   post:
 *     tags:
 *       - Machinery
 *     summary: Crear múltiples maquinarias
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name: { type: string }
 *                 brand: { type: string }
 *                 location: { type: string }
 *                 description: { type: string }
 *                 rental_price: { type: number }
 *                 image_code: { type: string }
 *                 state: { type: boolean }
 *                 provider_id: { type: string, format: uuid }
 *     responses:
 *       201: { description: Maquinarias creadas exitosamente }
 *       400: { description: Datos inválidos o proveedor no encontrado }
 *       500: { description: Error al crear maquinarias }
 */
router.post('/bulk', async (req, res) => {
  try {
    const machineryData = req.body;
    if (!Array.isArray(machineryData) || machineryData.length === 0) {
      return res.status(400).json({ error: 'Debe enviar un arreglo de maquinarias' });
    }

    for (let data of machineryData) {
      const { name, brand, location, rental_price, provider_id } = data;
      if (!name || !brand || !location || !rental_price || !provider_id) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      const providerExists = await Provider.findByPk(provider_id);
      if (!providerExists) {
        return res.status(400).json({ error: `Proveedor con ID ${provider_id} no existe` });
      }
    }

    const newMachinery = await Machinery.bulkCreate(machineryData);
    res.status(201).json(newMachinery);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear maquinarias', details: error.message });
  }
});

// ==========================
// 🔹 PUT: Actualizar maquinaria
// ==========================
/**
 * @swagger
 * /machinery/{id}:
 *   put:
 *     tags:
 *       - Machinery
 *     summary: Actualizar maquinaria por su ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, brand, location, description, rental_price, image_code, state, provider_id } = req.body;

    if (provider_id) {
      const providerExists = await Provider.findByPk(provider_id);
      if (!providerExists) {
        return res.status(400).json({ error: 'El proveedor especificado no existe' });
      }
    }

    const [updated] = await Machinery.update(
      { name, brand, location, description, rental_price, image_code, state, provider_id },
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

// ==========================
// 🔹 DELETE: Eliminar maquinaria
// ==========================
/**
 * @swagger
 * /machinery/{id}:
 *   delete:
 *     tags:
 *       - Machinery
 *     summary: Eliminar maquinaria por su ID
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

/**
 * @swagger
 * /machinery/bulk:
 *   delete:
 *     tags:
 *       - Machinery
 *     summary: Eliminar múltiples maquinarias
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["uuid1", "uuid2"]
 *     responses:
 *       200: { description: Maquinarias eliminadas exitosamente }
 *       400: { description: No se enviaron IDs válidos }
 *       500: { description: Error al eliminar maquinarias }
 */
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Debe enviar un arreglo de IDs' });
    }

    const deletedCount = await Machinery.destroy({ where: { id: ids } });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'No se encontraron maquinarias con los IDs proporcionados' });
    }

    res.status(200).json({ message: `Se eliminaron ${deletedCount} maquinarias` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar maquinarias', details: error.message });
  }
});

module.exports = router;
