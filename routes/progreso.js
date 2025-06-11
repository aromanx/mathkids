const express = require('express');
const { runQuery, getRow, getAll } = require('../database');

const router = express.Router();

// GET /api/progreso/usuario/:correo - Obtener progreso del usuario
router.get('/usuario/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    // Obtener progreso diario
    const progresoDiario = await getAll(`
      SELECT 
        p.id,
        p.usuario_id,
        p.fecha,
        p.ejercicios_completados,
        p.tiempo_total,
        p.puntuacion_total,
        u.nombre as nombre_usuario
      FROM progreso_diario p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE u.correo = ?
      ORDER BY p.fecha DESC
      LIMIT 30
    `, [correo]);
    
    // Obtener estadísticas de progreso
    const stats = await getRow(`
      SELECT 
        COUNT(*) as dias_activo,
        SUM(ejercicios_completados) as ejercicios_totales,
        SUM(tiempo_total) as tiempo_total,
        SUM(puntuacion_total) as puntuacion_total,
        AVG(ejercicios_completados) as promedio_ejercicios_dia,
        AVG(puntuacion_total) as promedio_puntuacion_dia
      FROM progreso_diario p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE u.correo = ?
    `, [correo]);
    
    res.json({
      success: true,
      data: {
        progreso_diario: progresoDiario,
        estadisticas: stats
      }
    });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/progreso - Registrar progreso diario
router.post('/', async (req, res) => {
  try {
    const { correo_usuario, ejercicios_completados, tiempo_total, puntuacion_total } = req.body;
    
    // Validaciones
    if (!correo_usuario) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Correo de usuario es requerido'
      });
    }
    
    // Verificar si el usuario existe
    const usuario = await getRow(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo_usuario]
    );
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con correo ${correo_usuario}`
      });
    }
    
    // Insertar o actualizar progreso diario
    const result = await runQuery(`
      INSERT OR REPLACE INTO progreso_diario (
        usuario_id,
        fecha,
        ejercicios_completados,
        tiempo_total,
        puntuacion_total
      )
      VALUES (?, CURRENT_DATE, ?, ?, ?)
    `, [
      usuario.id,
      parseInt(ejercicios_completados || 0),
      parseFloat(tiempo_total || 0),
      parseInt(puntuacion_total || 0)
    ]);
    
    // Obtener el progreso registrado
    const progresoRegistrado = await getRow(`
      SELECT 
        p.id,
        p.usuario_id,
        p.fecha,
        p.ejercicios_completados,
        p.tiempo_total,
        p.puntuacion_total,
        u.nombre as nombre_usuario
      FROM progreso_diario p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = ? AND p.fecha = CURRENT_DATE
    `, [usuario.id]);
    
    res.status(201).json({
      success: true,
      message: 'Progreso registrado exitosamente',
      data: progresoRegistrado
    });
    
  } catch (error) {
    console.error('Error registrando progreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/progreso/:id - Eliminar progreso por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await runQuery('DELETE FROM progreso_diario WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Progreso no encontrado',
        message: `No se encontró un progreso con ID ${id}`
      });
    }
    res.json({
      success: true,
      message: 'Progreso eliminado correctamente',
      id
    });
  } catch (error) {
    console.error('Error eliminando progreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/progreso/usuario/:correo - Eliminar todo el progreso de un usuario
router.delete('/usuario/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    // Verificar si el usuario existe
    const usuario = await getRow(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con correo ${correo}`
      });
    }
    
    // Eliminar todo el progreso del usuario
    const result = await runQuery('DELETE FROM progreso_diario WHERE usuario_id = ?', [usuario.id]);
    
    res.json({
      success: true,
      message: `Se eliminó todo el progreso del usuario ${correo}`,
      registrosEliminados: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando progreso del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/progreso - Eliminar todo el progreso (panel del profesor)
router.delete('/', async (req, res) => {
  try {
    // Eliminar todo el progreso
    const result = await runQuery('DELETE FROM progreso_diario');
    
    res.json({
      success: true,
      message: `Se eliminó todo el progreso (${result.changes} registros)`,
      registrosEliminados: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando todo el progreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router; 