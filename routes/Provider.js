const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

/**
 * @swagger
 * tags:
 *   - name: Provider
 *     description: Operaciones relacionadas con los proveedores
 */

/**
 * @swagger
 * /providers:
 *   post:
 *     tags:
 *       - Provider
 *     summary: Crear un nuevo proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Proveedor creado exitosamente
 *       400:
 *         description: El correo electrónico ya está en uso
 *       500:
 *         description: Error al crear el proveedor
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, rating } = req.body;

        // Verificar si el correo electrónico ya está en uso
        const existingProvider = await Provider.findOne({ where: { email } });
        if (existingProvider) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
        }

        // Crear el proveedor sin encriptar la contraseña
        const newProvider = await Provider.create({ name, email, password, phoneNumber, rating });
        res.status(200).json(newProvider);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proveedor', details: error.message });
    }
});

/**
 * @swagger
 * /providers/bulk:
 *   post:
 *     tags:
 *       - Provider
 *     summary: Crear múltiples proveedores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 rating:
 *                   type: number
 *     responses:
 *       200:
 *         description: Proveedores creados exitosamente
 *       400:
 *         description: Algunos correos electrónicos ya están en uso
 *       500:
 *         description: Error al crear los proveedores
 */
router.post('/bulk', async (req, res) => {
    try {
        const providers = req.body; // Suponiendo que envían un array de proveedores

        if (!Array.isArray(providers) || providers.length === 0) {
            return res.status(400).json({ error: 'Se requiere un array de proveedores' });
        }

        // Extraer los correos electrónicos para verificar duplicados
        const emails = providers.map(p => p.email);
        const existingProviders = await Provider.findAll({ where: { email: emails } });

        if (existingProviders.length > 0) {
            const existingEmails = existingProviders.map(p => p.email);
            return res.status(400).json({ 
                error: 'Algunos correos electrónicos ya están en uso', 
                emailsEnUso: existingEmails 
            });
        }

        // Insertar los proveedores en bloque
        const newProviders = await Provider.bulkCreate(providers);
        res.status(200).json(newProviders);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear los proveedores', details: error.message });
    }
});

/**
 * @swagger
 * /providers:
 *   get:
 *     tags:
 *       - Provider
 *     summary: Obtener todos los proveedores
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *       500:
 *         description: Error al obtener proveedores
 */
router.get('/', async (req, res) => {
    try {
        const providers = await Provider.findAll();
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores', details: error.message });
    }
});


/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     tags:
 *       - Provider
 *     summary: Obtener un proveedor por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del proveedor a obtener
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al obtener el proveedor
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await Provider.findByPk(id);

        if (!provider) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.status(200).json(provider);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor', details: error.message });
    }
});


/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     tags:
 *       - Provider
 *     summary: Actualizar un proveedor por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proveedor a actualizar
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Proveedor actualizado exitosamente
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al actualizar el proveedor
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, rating } = req.body;
        const updateData = { name, email, phoneNumber, rating };
        if (password) updateData.password = password;

        const updatedProvider = await Provider.update(updateData, { where: { id: req.params.id } });

        if (updatedProvider[0] === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el proveedor', details: error.message });
    }
});

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     tags:
 *       - Provider
 *     summary: Eliminar un proveedor por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proveedor a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proveedor eliminado exitosamente
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al eliminar el proveedor
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedProvider = await Provider.destroy({ where: { id: req.params.id } });
        if (deletedProvider === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proveedor', details: error.message });
    }
});
/**
 * @swagger
 * /providers/login:
 *   post:
 *     tags:
 *       - Provider
 *     summary: Iniciar sesión de un proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del proveedor
 *               password:
 *                 type: string
 *                 description: Contraseña del proveedor
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 rating:
 *                   type: number
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error en el servidor
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se proporcionaron email y password
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Se requieren email y contraseña' 
            });
        }

        // Buscar el proveedor por email
        const provider = await Provider.findOne({ 
            where: { email },
            attributes: ['id', 'name', 'email', 'phoneNumber', 'rating', 'password']
        });

        if (!provider) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Verificar la contraseña
        if (provider.password !== password) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Crear objeto de respuesta sin la contraseña
        const providerData = {
            id: provider.id,
            name: provider.name,
            email: provider.email,
            phoneNumber: provider.phoneNumber,
            rating: provider.rating
        };

        res.status(200).json(providerData);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error en el servidor', 
            details: error.message 
        });
    }
});

module.exports = router;
