const jwt = require('jsonwebtoken');
const JWT_SECRET = 'omnistock_super_secret_key_2026';

// Valida que el usuario tenga un token legítimo activo
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ error: 'Acceso denegado. Token requerido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ error: 'Token inválido o expirado.' });
        req.user = user; // Inyecta los datos del usuario en la petición
        next();
    });
};

// Valida que el token pertenezca a un ADMIN
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Permisos insuficientes. Requiere rol Administrador.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };