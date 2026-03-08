const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// ==========================================
// --- RUTAS DE AUTENTICACIÓN ---
// ==========================================

// Registro de nuevos usuarios
router.post('/registro', async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        // Encriptar contraseña antes de guardar
        const hash = await bcrypt.hash(password, 10);
        
        // El rol por defecto en la base de datos debería ser 'usuario'
        await db.query(
            "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, 'usuario')", 
            [nombre, correo, hash]
        );
        
        res.json({ success: true, message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: error.message });
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const [users] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);

        if (users.length > 0) {
            const coincide = await bcrypt.compare(password, users[0].password);
            
            if (coincide) {
                return res.json({ 
                    success: true, 
                    user: { 
                        id: users[0].id, 
                        nombre: users[0].nombre, 
                        rol: users[0].rol 
                    } 
                });
            }
        }
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// --- RUTAS DE REPORTES ---
// ==========================================

// Obtener todos los reportes con el nombre del autor (para el Panel de Control)
router.get('/estadisticas', async (req, res) => {
    try {
        const query = `
            SELECT r.*, u.nombre as autor 
            FROM reportes r 
            LEFT JOIN usuarios u ON r.usuario_id = u.id 
            ORDER BY r.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo reporte
router.post('/reportes', async (req, res) => {
    try {
        const { tipo, descripcion, anonimo, ubicacion, usuario_id } = req.body;
        const query = `
            INSERT INTO reportes (tipo, descripcion, anonimo, ubicacion, estado, usuario_id) 
            VALUES (?, ?, ?, ?, 'nuevo', ?)
        `;
        await db.query(query, [tipo, descripcion, anonimo, ubicacion, usuario_id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error al guardar reporte:", error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar el estado de un reporte (nuevo -> revision -> resuelto)
router.put('/reportes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        await db.query("UPDATE reportes SET estado = ? WHERE id = ?", [estado, id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error al actualizar reporte:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// --- RUTAS DE GESTIÓN DE USUARIOS ---
// ==========================================

// Obtener lista de todos los usuarios (para la pestaña Gestionar Usuarios)
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, nombre, correo, rol FROM usuarios ORDER BY id ASC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener lista de usuarios:", error);
        res.status(500).json({ error: error.message });
    }
});

// Cambiar el rol de un usuario (Ascender a Admin)
router.put('/usuarios/rol/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoRol } = req.body;
        await db.query("UPDATE usuarios SET rol = ? WHERE id = ?", [nuevoRol, id]);
        res.json({ success: true, message: "Rol actualizado correctamente" });
    } catch (error) {
        console.error("Error al cambiar rol:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;