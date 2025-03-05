const cloudinary = require('../config/cloudinary');

const uploadImage = async (filePath, publicId = null) => {
    try {
        const options = { folder: 'maquinaria' }; // Carpeta en Cloudinary
        if (publicId) options.public_id = publicId; // Si se pasa un public_id, lo usa

        const result = await cloudinary.uploader.upload(filePath, options);
        return result.secure_url; // Devuelve la URL de la imagen
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw new Error('No se pudo subir la imagen');
    }
};

module.exports = uploadImage;
