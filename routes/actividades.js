const express = require('express');
const { runQuery, getRow, getAll } = require('../database');

const router = express.Router();

// GET /api/actividades - Obtener todas las actividades
router.get('/', async (req, res) => {
  try {
    const actividades = await getAll(`
      SELECT 
        a.id,
        a.usuario_id,
        a.correo_usuario,
        a.tipo_ejercicio,
        a.puntuacion,
        a.tiempo_promedio,
        a.precision,
        a.ejercicios_completados,
        a.ejercicios_totales,
        a.nivel_alcanzado,
        a.estrellas_obtenidas,
        a.fecha_hora,
        u.nombre as nombre_usuario
      FROM actividades a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.fecha_hora DESC
    `);
    
    res.json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/actividades/usuario/:correo - Obtener actividades por correo de usuario
router.get('/usuario/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    const actividades = await getAll(`
      SELECT 
        a.id,
        a.usuario_id,
        a.correo_usuario,
        a.tipo_ejercicio,
        a.puntuacion,
        a.tiempo_promedio,
        a.precision,
        a.ejercicios_completados,
        a.ejercicios_totales,
        a.nivel_alcanzado,
        a.estrellas_obtenidas,
        a.fecha_hora,
        u.nombre as nombre_usuario
      FROM actividades a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.correo_usuario = ?
      ORDER BY a.fecha_hora DESC
    `, [correo]);
    
    res.json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error obteniendo actividades del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/actividades/:id - Obtener actividad por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const actividad = await getRow(`
      SELECT 
        a.id,
        a.usuario_id,
        a.correo_usuario,
        a.tipo_ejercicio,
        a.puntuacion,
        a.tiempo_promedio,
        a.precision,
        a.ejercicios_completados,
        a.ejercicios_totales,
        a.nivel_alcanzado,
        a.estrellas_obtenidas,
        a.fecha_hora,
        u.nombre as nombre_usuario
      FROM actividades a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = ?
    `, [id]);
    
    if (!actividad) {
      return res.status(404).json({
        success: false,
        error: 'Actividad no encontrada',
        message: `No se encontró una actividad con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/actividades - Crear nueva actividad
router.post('/', async (req, res) => {
  try {
    const {
      correo_usuario,
      tipo_ejercicio,
      puntuacion = 0,
      tiempo_promedio = 0,
      precision = 0,
      ejercicios_completados = 0,
      ejercicios_totales = 0,
      nivel_alcanzado = 1,
      estrellas_obtenidas = 0
    } = req.body;
    
    // Validaciones
    if (!correo_usuario || !tipo_ejercicio) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Correo de usuario y tipo de ejercicio son requeridos'
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
    
    // Insertar nueva actividad
    const result = await runQuery(`
      INSERT INTO actividades (
        usuario_id,
        correo_usuario,
        tipo_ejercicio,
        puntuacion,
        tiempo_promedio,
        precision,
        ejercicios_completados,
        ejercicios_totales,
        nivel_alcanzado,
        estrellas_obtenidas
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      usuario.id,
      correo_usuario,
      tipo_ejercicio,
      parseInt(puntuacion),
      parseFloat(tiempo_promedio),
      parseFloat(precision),
      parseInt(ejercicios_completados),
      parseInt(ejercicios_totales),
      parseInt(nivel_alcanzado),
      parseInt(estrellas_obtenidas)
    ]);
    
    // Obtener la actividad creada
    const nuevaActividad = await getRow(`
      SELECT 
        a.id,
        a.usuario_id,
        a.correo_usuario,
        a.tipo_ejercicio,
        a.puntuacion,
        a.tiempo_promedio,
        a.precision,
        a.ejercicios_completados,
        a.ejercicios_totales,
        a.nivel_alcanzado,
        a.estrellas_obtenidas,
        a.fecha_hora,
        u.nombre as nombre_usuario
      FROM actividades a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = ?
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Actividad registrada exitosamente',
      data: nuevaActividad
    });
    
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/actividades/estadisticas/:correo - Obtener estadísticas del usuario
router.get('/estadisticas/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    // Estadísticas generales
    const stats = await getRow(`
      SELECT 
        COUNT(*) as total_actividades,
        SUM(puntuacion) as puntuacion_total,
        AVG(puntuacion) as puntuacion_promedio,
        AVG(tiempo_promedio) as tiempo_promedio_general,
        AVG(precision) as precision_promedio,
        SUM(ejercicios_completados) as ejercicios_completados_total,
        MAX(nivel_alcanzado) as nivel_maximo,
        SUM(estrellas_obtenidas) as estrellas_total
      FROM actividades 
      WHERE correo_usuario = ?
    `, [correo]);
    
    // Actividades por tipo
    const actividadesPorTipo = await getAll(`
      SELECT 
        tipo_ejercicio,
        COUNT(*) as cantidad,
        AVG(puntuacion) as puntuacion_promedio,
        AVG(precision) as precision_promedio
      FROM actividades 
      WHERE correo_usuario = ?
      GROUP BY tipo_ejercicio
      ORDER BY cantidad DESC
    `, [correo]);
    
    // Últimas 5 actividades
    const ultimasActividades = await getAll(`
      SELECT 
        tipo_ejercicio,
        puntuacion,
        precision,
        ejercicios_completados,
        fecha_hora
      FROM actividades 
      WHERE correo_usuario = ?
      ORDER BY fecha_hora DESC
      LIMIT 5
    `, [correo]);
    
    res.json({
      success: true,
      data: {
        estadisticas_generales: stats,
        actividades_por_tipo: actividadesPorTipo,
        ultimas_actividades: ultimasActividades
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/actividades/:id - Eliminar actividad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la actividad existe
    const actividadExistente = await getRow(
      'SELECT id FROM actividades WHERE id = ?',
      [id]
    );
    
    if (!actividadExistente) {
      return res.status(404).json({
        success: false,
        error: 'Actividad no encontrada',
        message: `No se encontró una actividad con ID ${id}`
      });
    }
    
    // Eliminar actividad
    await runQuery('DELETE FROM actividades WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/actividades/usuario/:correo - Eliminar todas las actividades de un usuario
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
    
    // Eliminar todas las actividades del usuario
    const result = await runQuery('DELETE FROM actividades WHERE correo_usuario = ?', [correo]);
    
    res.json({
      success: true,
      message: `Se eliminaron ${result.changes} actividades del usuario ${correo}`,
      actividadesEliminadas: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando actividades del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/actividades - Eliminar todas las actividades (panel del profesor)
router.delete('/', async (req, res) => {
  try {
    // Eliminar todas las actividades
    const result = await runQuery('DELETE FROM actividades');
    
    res.json({
      success: true,
      message: `Se eliminaron todas las actividades (${result.changes} registros)`,
      actividadesEliminadas: result.changes
    });
    
  } catch (error) {
    console.error('Error eliminando todas las actividades:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router; 