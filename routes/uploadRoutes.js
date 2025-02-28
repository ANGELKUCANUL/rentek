const express = require('express');
const multer = require('multer');
const uploadImage = require('../models/uploadService');

const router = express.Router();

// Multer configura dónde guardar temporalmente las imágenes
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: Operaciones de subida de imágenes
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Sube una imagen a Cloudinary
 *     description: Permite subir una imagen y obtener la URL de Cloudinary.
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
 *     responses:
 *       200:
 *         description: Imagen subida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: No se ha subido ninguna imagen
 *       500:
 *         description: Error al subir la imagen
 */
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No se ha subido ninguna imagen' });

        const imageUrl = await uploadImage(req.file.path);
        res.json({ message: 'Imagen subida con éxito', imageUrl });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
    }
});
/**
 * @swagger
 * /api/upload/images:
 *   get:
 *     tags:
 *       - Upload
 *     summary: Obtiene todas las imágenes subidas a Cloudinary
 *     description: Retorna una lista de URLs e IDs de las imágenes subidas a la carpeta "maquinaria".
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       public_id:
 *                         type: string
 *                       secure_url:
 *                         type: string
 *       500:
 *         description: Error al obtener las imágenes
 */
router.get('/upload/images', async (req, res) => {
    try {
        const { resources } = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'maquinaria', // Filtra solo la carpeta "maquinaria"
            max_results: 50 // Puedes ajustar este número
        });

        const images = resources.map(img => ({
            public_id: img.public_id,
            secure_url: img.secure_url
        }));

        res.json({ images });
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
    }
});

module.exports = router;
