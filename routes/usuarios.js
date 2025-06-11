const express = require('express');
const { runQuery, getRow, getAll } = require('../database');

const router = express.Router();

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await getAll(`
      SELECT 
        id, 
        nombre, 
        correo, 
        edad, 
        fecha_registro,
        fecha_actualizacion
      FROM usuarios 
      ORDER BY fecha_registro DESC
    `);
    
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await getRow(`
      SELECT 
        id, 
        nombre, 
        correo, 
        edad, 
        fecha_registro,
        fecha_actualizacion
      FROM usuarios 
      WHERE id = ?
    `, [id]);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/usuarios/correo/:correo - Obtener usuario por correo
router.get('/correo/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    const usuario = await getRow(`
      SELECT 
        id, 
        nombre, 
        correo, 
        edad, 
        fecha_registro,
        fecha_actualizacion
      FROM usuarios 
      WHERE correo = ?
    `, [correo]);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con correo ${correo}`
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario por correo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, edad } = req.body;
    
    // Validaciones
    if (!nombre || !correo || !edad) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Nombre, correo y edad son requeridos'
      });
    }
    
    if (edad < 5 || edad > 12) {
      return res.status(400).json({
        success: false,
        error: 'Edad inválida',
        message: 'La edad debe estar entre 5 y 12 años'
      });
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        error: 'Correo inválido',
        message: 'El formato del correo electrónico no es válido'
      });
    }
    
    // Verificar si el correo ya existe
    const usuarioExistente = await getRow(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'Correo ya registrado',
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }
    
    // Insertar nuevo usuario
    const result = await runQuery(`
      INSERT INTO usuarios (nombre, correo, edad)
      VALUES (?, ?, ?)
    `, [nombre, correo, parseInt(edad)]);
    
    // Obtener el usuario creado
    const nuevoUsuario = await getRow(`
      SELECT 
        id, 
        nombre, 
        correo, 
        edad, 
        fecha_registro,
        fecha_actualizacion
      FROM usuarios 
      WHERE id = ?
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario
    });
    
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad } = req.body;
    
    // Validaciones
    if (!nombre || !edad) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Nombre y edad son requeridos'
      });
    }
    
    if (edad < 5 || edad > 12) {
      return res.status(400).json({
        success: false,
        error: 'Edad inválida',
        message: 'La edad debe estar entre 5 y 12 años'
      });
    }
    
    // Verificar si el usuario existe
    const usuarioExistente = await getRow(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }
    
    // Actualizar usuario
    await runQuery(`
      UPDATE usuarios 
      SET nombre = ?, edad = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nombre, parseInt(edad), id]);
    
    // Obtener el usuario actualizado
    const usuarioActualizado = await getRow(`
      SELECT 
        id, 
        nombre, 
        correo, 
        edad, 
        fecha_registro,
        fecha_actualizacion
      FROM usuarios 
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
    
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const usuarioExistente = await getRow(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No se encontró un usuario con ID ${id}`
      });
    }
    
    // Eliminar usuario (esto también eliminará registros relacionados por foreign key)
    await runQuery('DELETE FROM usuarios WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router; 