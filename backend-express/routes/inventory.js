const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear un nuevo producto
router.post('/products', async (req, res) => {
    const { name, sku, category_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, sku, category_id) VALUES ($1, $2, $3) RETURNING *',
            [name, sku, category_id || null]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Registrar un movimiento
router.post('/movements', async (req, res) => {
    const { product_id, movement_type, quantity, notes } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO movements (product_id, movement_type, quantity, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, movement_type.toUpperCase(), quantity, notes]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener productos
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'id', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        // Validar columnas de ordenamiento para evitar Inyección SQL
        const validSortColumns = ['id', 'name', 'sku', 'current_stock'];
        const sortColumn = validSortColumns.includes(sort) ? sort : 'id';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // ILIKE permite búsqueda insensible a mayúsculas/minúsculas en PostgreSQL
        const query = `
            SELECT * FROM products 
            WHERE name ILIKE $1 OR sku ILIKE $1 
            ORDER BY ${sortColumn} ${sortOrder} 
            LIMIT $2 OFFSET $3
        `;
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);

        // Obtener el total de registros para los metadatos del frontend
        const countQuery = `SELECT COUNT(*) FROM products WHERE name ILIKE $1 OR sku ILIKE $1`;
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        const totalItems = parseInt(countResult.rows[0].count);

        res.json({
            data: result.rows,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener historial de movimientos de un producto (Kardex)
router.get('/products/:id/movements', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT id, movement_type, quantity, notes, created_at 
            FROM movements 
            WHERE product_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [id]);
        res.json({ data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;