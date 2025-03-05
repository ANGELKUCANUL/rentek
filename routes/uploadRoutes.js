const express = require('express');
const multer = require('multer');
const uploadImage = require('../models/uploadService');
const Upload = require('../models/upload'); // Modelo de Sequelize

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Sube una imagen a Cloudinary y guarda los datos en la BD
 *     description: Permite subir una imagen, recibir información adicional y guardarla en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               nombre_maquina:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen subida y datos guardados con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 nombre_maquina:
 *                   type: string
 *       400:
 *         description: Datos insuficientes o imagen no subida
 *       500:
 *         description: Error en la operación
 */
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { nombre_maquina } = req.body;
        if (!req.file || !nombre_maquina) {
            return res.status(400).json({ message: 'Faltan datos: imagen y nombre de la máquina son requeridos' });
        }

        // Sube la imagen a Cloudinary
        const imageUrl = await uploadImage(req.file.path);

        // Guarda los datos en la base de datos
        const newUpload = await Upload.create({
            image_url: imageUrl,
            nombre_maquina
        });

        res.json({
            message: 'Imagen subida y datos guardados con éxito',
            imageUrl: newUpload.image_url,
            nombre_maquina: newUpload.nombre_maquina
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
    }
});

/**
 * @swagger
 * /api/upload:
 *   get:
 *     tags:
 *       - Upload
 *     summary: Obtiene todas las imágenes almacenadas en la BD
 *     description: Retorna una lista de imágenes con sus respectivos nombres de maquinaria.
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   image_url:
 *                     type: string
 *                   nombre_maquina:
 *                     type: string
 *       500:
 *         description: Error al obtener las imágenes
 */
router.get('/upload', async (req, res) => {
    try {
        const uploads = await Upload.findAll();
        res.json(uploads);
    } catch (error) {
        console.error('Error al obtener las imágenes:', error);
        res.status(500).json({ message: 'Error al obtener las imágenes', error: error.message });
    }
});

module.exports = router;
