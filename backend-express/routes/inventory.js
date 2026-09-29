const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware'); // <-- Importamos los candados

// 1. Crear un nuevo producto (Protegida: Solo Administradores)
router.post('/products', verifyToken, isAdmin, async (req, res) => {
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

// 2. Registrar un movimiento (Protegida: Cualquier usuario autenticado)
router.post('/movements', verifyToken, async (req, res) => {
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

// 3. Obtener productos (Protegida: Cualquier usuario autenticado)
router.get('/products', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'id', order = 'desc' } = req.query;
        const offset = (page - 1) * limit;

        const validSortColumns = ['id', 'name', 'sku', 'current_stock'];
        const sortColumn = validSortColumns.includes(sort) ? sort : 'id';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const query = `
            SELECT * FROM products 
            WHERE name ILIKE $1 OR sku ILIKE $1 
            ORDER BY ${sortColumn} ${sortOrder} 
            LIMIT $2 OFFSET $3
        `;
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);

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

// 4. Obtener historial de movimientos de un producto individual (Protegida: Cualquier usuario autenticado)
router.get('/products/:id/movements', verifyToken, async (req, res) => {
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

// 5. Obtener el historial completo (Kardex Global) para el CSV (Protegida: Solo Administradores)
router.get('/movements/all', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                m.created_at, 
                p.name AS product_name, 
                p.sku, 
                m.movement_type, 
                m.quantity, 
                m.notes 
            FROM movements m
            JOIN products p ON m.product_id = p.id
            ORDER BY m.created_at DESC
        `;
        const result = await pool.query(query);
        res.json({ data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;