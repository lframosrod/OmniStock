const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware'); // Candado de seguridad

// Obtener resumen analítico (Protegido: Solo usuarios con sesión)
router.get('/summary', verifyToken, async (req, res) => {
    try {
        // Total de productos registrados
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');

        // Total de movimientos realizados HOY
        const movementsToday = await pool.query('SELECT COUNT(*) FROM movements WHERE DATE(created_at) = CURRENT_DATE');

        // Top 5 productos con más actividad (Entradas/Salidas) para la gráfica
        const topProducts = await pool.query(`
            SELECT p.name, COUNT(m.id) as movimientos
            FROM products p
            JOIN movements m ON p.id = m.product_id
            GROUP BY p.id, p.name
            ORDER BY movimientos DESC
            LIMIT 5
        `);

        // Devolvemos todo empaquetado al frontend
        res.json({
            data: {
                totalProducts: parseInt(productsCount.rows[0].count),
                movementsToday: parseInt(movementsToday.rows[0].count),
                chartData: topProducts.rows
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;