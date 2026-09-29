const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middleware'); // <-- NUEVA LÍNEA: Importamos los candados

const JWT_SECRET = 'omnistock_super_secret_key_2026';

// Ruta para crear un usuario (Protegida: Solo Administradores)
router.post('/register', verifyToken, isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // Encriptar la contraseña (nunca se guarda en texto plano)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, role || 'ADMIN']
        );
        res.status(201).json({ message: "Usuario creado", data: result.rows[0] });
    } catch (error) {
        res.status(400).json({ error: "Error al crear usuario. ¿Quizás el usuario ya existe?" });
    }
});

// Ruta de Login (Pública: Cualquiera puede intentar iniciar sesión)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Buscar el usuario en la base de datos
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userQuery.rows[0];

        // Comparar la contraseña ingresada con la contraseña encriptada
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar el JSON Web Token (JWT)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Devolver el token al frontend
        res.json({
            message: "Autenticación exitosa",
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener lista de usuarios (Protegida: Solo Administradores)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY id ASC');
        res.json({ data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;