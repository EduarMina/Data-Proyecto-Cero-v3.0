const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para ver todos los reportes (GET)
router.get('/estadisticas', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM reportes ORDER BY fecha_incidente DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para enviar reportes (POST)
router.post('/reportes', async (req, res) => {
    try {
        const { tipo, descripcion, anonimo, ubicacion } = req.body;
        await db.query(
            "INSERT INTO reportes (tipo_bullying, descripcion, es_anonimo, ubicacion_colegio) VALUES (?, ?, ?, ?)",
            [tipo, descripcion, anonimo, ubicacion]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ESTA ES LA RUTA QUE TE FALTA (PUT)
router.put('/reportes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;
        await db.query("UPDATE reportes SET estado = ? WHERE id = ?", [nuevoEstado, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;