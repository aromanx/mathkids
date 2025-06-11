const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const actividadesRoutes = require('./routes/actividades');
const progresoRoutes = require('./routes/progreso');
const logrosRoutes = require('./routes/logros');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: true, // Permitir todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/logros', logrosRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MathKids API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Bienvenido a MathKids API',
    description: 'API para la aplicación educativa de matemáticas',
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios',
      actividades: '/api/actividades',
      progreso: '/api/progreso',
      logros: '/api/logros'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/usuarios',
      'POST /api/usuarios',
      'GET /api/actividades',
      'POST /api/actividades',
      'GET /api/progreso',
      'POST /api/progreso',
      'GET /api/logros',
      'POST /api/logros'
    ]
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor MathKids API iniciado');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('✨ ¡Listo para recibir peticiones!');
});

module.exports = app; 