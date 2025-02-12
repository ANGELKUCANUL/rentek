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

module.exports = router;
