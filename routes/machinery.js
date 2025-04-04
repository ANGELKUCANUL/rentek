const express = require('express');
const router = express.Router();
const Machinery = require('../models/Machinery');
const Provider = require('../models/Provider');
const multer = require('multer');
const uploadImage = require('../models/uploadService');
const upload = multer({ dest: 'uploads/' });
const Upload = require('../models/upload'); // Modelo de subida de imágenes



const storage = multer.memoryStorage();

/**
 * @swagger
 * tags:
 *   - name: Machinery
 *     description: Operaciones relacionadas con la maquinaria
 *   - name: Machinery method get
 *     description: gets relacionados con la maquinaria
 * 
 */

// ==========================
// 🔹 GET: Obtener maquinarias
/**
 * @swagger
 * /machinery:
 *   get:
 *     tags:
 *       - Machinery method get
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
 *       - Machinery method get
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
 *       - Machinery met get
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
// 🔹 POST: Crear una maquinaria asociada a un proveedor
// ==========================
/**
 * @swagger
 * /machinery/{provider_id}:
 *   post:
 *     tags:
 *       - Machinery
 *     summary: Crear una nueva maquinaria asociada a un proveedor y guardar imagen en la tabla upload
 *     parameters:
 *       - in: path
 *         name: provider_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               brand: { type: string }
 *               location: { type: string }
 *               description: { type: string }
 *               rental_price: { type: number }
 *               state: { type: boolean }
 *               image: 
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Maquinaria creada exitosamente y guardada en la tabla upload }
 *       400: { description: Datos inválidos o proveedor no encontrado }
 *       500: { description: Error al crear maquinaria }
 */
router.post('/:provider_id', upload.single('image'), async (req, res) => {
  try {
      const { provider_id } = req.params;
      const { name, brand, location, description, rental_price, state } = req.body;

      // Validar campos obligatorios
      if (!name || !brand || !location || !rental_price) {
          return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      // Verificar si el proveedor existe
      const providerExists = await Provider.findByPk(provider_id);
      if (!providerExists) {
          return res.status(400).json({ error: `Proveedor con ID ${provider_id} no encontrado` });
      }

      // Subir la imagen a Cloudinary si se envió
      let image_code = null;
      if (req.file) {
          console.log('✅ Imagen recibida:', req.file.path);
          try {
              image_code = await uploadImage(req.file.path);
              console.log('🌐 URL de imagen:', image_code);
          } catch (uploadError) {
              console.error('❌ Error al subir la imagen:', uploadError);
              return res.status(500).json({ error: 'Error al subir la imagen', details: uploadError.message });
          }
      }

      // Crear la maquinaria con la URL de la imagen
      const newMachinery = await Machinery.create({
          name,
          brand,
          location,
          description,
          rental_price,
          image_code,
          state,
          provider_id,
      });

      // Guardar la imagen en la tabla upload con el nombre de la máquina
      if (image_code) {
          await Upload.create({
              image_url: image_code,
              nombre_maquina: name, // Usa el nombre de la maquinaria
          });
          console.log('📂 Imagen guardada en la tabla upload');
      }

      res.status(201).json({ 
          message: 'Maquinaria creada y imagen guardada en la tabla upload',
          machinery: newMachinery 
      });
  } catch (error) {
      console.error('❌ Error al crear maquinaria:', error);
      res.status(500).json({ error: 'Error al crear maquinaria', details: error.message });
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


// ==========================
// 🔹 GET: Contar maquinarias
// ==========================
/**
 * @swagger
 * /machinery/count:
 *   get:
 *     tags:
 *       - Machinery method get
 *     summary: Contar el total de maquinarias
 *     responses:
 *       200: { description: Número total de maquinarias }
 *       500: { description: Error al contar maquinarias }
 */
router.get('/count', async (req, res) => {
  try {
    // Usamos Sequelize para contar el total de registros en la tabla 'Machinery'
    const count = await Machinery.count();

    // Devolvemos el conteo en la respuesta
    res.status(200).json({ total: count });
  } catch (error) {
    res.status(500).json({ error: 'Error al contar maquinarias', details: error.message });
  }
});


module.exports = router;
