const express = require('express');
const { runQuery, getRow, getAll } = require('../database');

const router = express.Router();

// GET /api/logros/usuario/:correo - Obtener logros del usuario
router.get('/usuario/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    const logros = await getAll(`
      SELECT 
        l.id,
        l.usuario_id,
        l.tipo_logro,
        l.descripcion,
        l.fecha_obtenido,
        u.nombre as nombre_usuario
      FROM logros l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE u.correo = ?
      ORDER BY l.fecha_obtenido DESC
    `, [correo]);
    
    res.json({
      success: true,
      data: logros,
      count: logros.length
    });
  } catch (error) {
    console.error('Error obteniendo logros:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/logros - Crear nuevo logro
router.post('/', async (req, res) => {
  try {
    const { correo_usuario, tipo_logro, descripcion } = req.body;
    
    // Validaciones
    if (!correo_usuario || !tipo_logro || !descripcion) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Correo de usuario, tipo de logro y descripción son requeridos'
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
    
    // Verificar si el logro ya existe para este usuario
    const logroExistente = await getRow(
      'SELECT id FROM logros WHERE usuario_id = ? AND tipo_logro = ?',
      [usuario.id, tipo_logro]
    );
    
    if (logroExistente) {
      return res.status(409).json({
        success: false,
        error: 'Logro ya obtenido',
        message: 'Este logro ya ha sido obtenido por el usuario'
      });
    }
    
    // Insertar nuevo logro
    const result = await runQuery(`
      INSERT INTO logros (usuario_id, tipo_logro, descripcion)
      VALUES (?, ?, ?)
    `, [usuario.id, tipo_logro, descripcion]);
    
    // Obtener el logro creado
    const nuevoLogro = await getRow(`
      SELECT 
        l.id,
        l.usuario_id,
        l.tipo_logro,
        l.descripcion,
        l.fecha_obtenido,
        u.nombre as nombre_usuario
      FROM logros l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.id = ?
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Logro registrado exitosamente',
      data: nuevoLogro
    });
    
  } catch (error) {
    console.error('Error creando logro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/logros/verificar - Verificar y otorgar logros automáticamente
router.post('/verificar', async (req, res) => {
  try {
    const { correo_usuario } = req.body;
    
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
    
    // Obtener estadísticas del usuario
    const stats = await getRow(`
      SELECT 
        COUNT(*) as total_actividades,
        SUM(ejercicios_completados) as ejercicios_completados_total,
        SUM(puntuacion) as puntuacion_total,
        AVG(precision) as precision_promedio
      FROM actividades 
      WHERE usuario_id = ?
    `, [usuario.id]);
    
    const logrosOtorgados = [];
    
    // Verificar logros basados en actividades completadas
    if (stats.ejercicios_completados_total >= 10) {
      const logro = await verificarYOtorgarLogro(usuario.id, 'primeros_pasos', '¡Primeros pasos! Completaste 10 ejercicios');
      if (logro) logrosOtorgados.push(logro);
    }
    
    if (stats.ejercicios_completados_total >= 50) {
      const logro = await verificarYOtorgarLogro(usuario.id, 'matematico_novato', '¡Matemático novato! Completaste 50 ejercicios');
      if (logro) logrosOtorgados.push(logro);
    }
    
    if (stats.ejercicios_completados_total >= 100) {
      const logro = await verificarYOtorgarLogro(usuario.id, 'matematico_experto', '¡Matemático experto! Completaste 100 ejercicios');
      if (logro) logrosOtorgados.push(logro);
    }
    
    // Verificar logros basados en precisión
    if (stats.precision_promedio >= 90) {
      const logro = await verificarYOtorgarLogro(usuario.id, 'alta_precision', '¡Alta precisión! Mantienes más del 90% de precisión');
      if (logro) logrosOtorgados.push(logro);
    }
    
    // Verificar logros basados en puntuación
    if (stats.puntuacion_total >= 1000) {
      const logro = await verificarYOtorgarLogro(usuario.id, 'puntuacion_1000', '¡Puntuación 1000! Alcanzaste 1000 puntos');
      if (logro) logrosOtorgados.push(logro);
    }
    
    res.json({
      success: true,
      message: 'Verificación de logros completada',
      data: {
        logros_otorgados: logrosOtorgados,
        total_logros: logrosOtorgados.length
      }
    });
    
  } catch (error) {
    console.error('Error verificando logros:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Función auxiliar para verificar y otorgar logros
async function verificarYOtorgarLogro(usuarioId, tipoLogro, descripcion) {
  try {
    // Verificar si el logro ya existe
    const logroExistente = await getRow(
      'SELECT id FROM logros WHERE usuario_id = ? AND tipo_logro = ?',
      [usuarioId, tipoLogro]
    );
    
    if (logroExistente) {
      return null; // El logro ya existe
    }
    
    // Otorgar el logro
    const result = await runQuery(`
      INSERT INTO logros (usuario_id, tipo_logro, descripcion)
      VALUES (?, ?, ?)
    `, [usuarioId, tipoLogro, descripcion]);
    
    return {
      id: result.id,
      tipo_logro: tipoLogro,
      descripcion: descripcion,
      fecha_obtenido: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error otorgando logro:', error);
    return null;
  }
}

// DELETE /api/logros/:id - Eliminar logro por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await runQuery('DELETE FROM logros WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Logro no encontrado',
        message: `No se encontró un logro con ID ${id}`
      });
    }
    res.json({
      success: true,
      message: 'Logro eliminado correctamente',
      id
    });
  } catch (error) {
    console.error('Error eliminando logro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/logros/usuario/:correo - Eliminar todos los logros de un usuario
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
    
    // Eliminar todos los logros del usuario
    const result = await runQuery('DELETE FROM logros WHERE usuario_id = ?', [usuario.id]);
    
    res.json({
      success: true,
      message: `Se eliminaron todos los logros del usuario ${correo}`,
      logrosEliminados: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando logros del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/logros - Eliminar todos los logros (panel del profesor)
router.delete('/', async (req, res) => {
  try {
    // Eliminar todos los logros
    const result = await runQuery('DELETE FROM logros');
    
    res.json({
      success: true,
      message: `Se eliminaron todos los logros (${result.changes} registros)`,
      logrosEliminados: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando todos los logros:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router; 