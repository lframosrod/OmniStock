require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const inventoryRoutes = require('./routes/inventory'); // Rutas de inventario
const authRoutes = require('./routes/auth'); // Rutas de autenticación
const dashboardRoutes = require('./routes/dashboard'); // Rutas de dashboard

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Montar los enrutadores
app.use('/api', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de diagnóstico
app.get('/api/db-status', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS system_time');
        res.json({ status: 'PostgreSQL Connected', timestamp: result.rows[0].system_time });
    } catch (error) {
        res.status(500).json({ status: 'Database Connection Failed', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor API de OmniStock en puerto ${PORT}`);
});