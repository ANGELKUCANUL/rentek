const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.buffer) {
            console.error('⚠ Archivo no válido o buffer vacío');
            return reject(new Error('Archivo no válido o buffer vacío'));
        }

        const options = { folder: 'maquinaria' }; // Carpeta en Cloudinary

        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                console.error('❌ Error en Cloudinary:', error);
                return reject(new Error('No se pudo subir la imagen'));
            }
            resolve(result.secure_url);
        });

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

module.exports = uploadImage;
