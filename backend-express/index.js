require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base
app.get('/', (req, res) => {
    res.json({
        service: 'OmniStock API',
        status: 'Online',
        message: '¡El Proxy Nginx está enrutando correctamente hacia Express!'
    });
});

// Ruta de diagnóstico para la base de datos
app.get('/db-status', async (req, res) => {
    try {
        // Ejecutamos una consulta simple para verificar la conexión
        const result = await pool.query('SELECT NOW() AS system_time');
        res.json({
            status: 'PostgreSQL Connected',
            timestamp: result.rows[0].system_time
        });
    } catch (error) {
        console.error('Error de conexión a BD:', error.message);
        res.status(500).json({
            status: 'Database Connection Failed',
            error: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend de OmniStock corriendo en el puerto ${PORT}`);
});