const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear la base de datos en el directorio actual
const dbPath = path.join(__dirname, 'mathkids.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Inicializando base de datos MathKids...');

// Crear tabla de usuarios
db.serialize(() => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      edad INTEGER NOT NULL,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla usuarios:', err.message);
    } else {
      console.log('✅ Tabla usuarios creada correctamente');
    }
  });

  // Tabla de actividades/ejercicios
  db.run(`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      correo_usuario TEXT NOT NULL,
      tipo_ejercicio TEXT NOT NULL,
      puntuacion INTEGER DEFAULT 0,
      tiempo_promedio REAL DEFAULT 0,
      precision REAL DEFAULT 0,
      ejercicios_completados INTEGER DEFAULT 0,
      ejercicios_totales INTEGER DEFAULT 0,
      nivel_alcanzado INTEGER DEFAULT 1,
      estrellas_obtenidas INTEGER DEFAULT 0,
      fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla actividades:', err.message);
    } else {
      console.log('✅ Tabla actividades creada correctamente');
    }
  });

  // Tabla de progreso diario
  db.run(`
    CREATE TABLE IF NOT EXISTS progreso_diario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      fecha DATE DEFAULT CURRENT_DATE,
      ejercicios_completados INTEGER DEFAULT 0,
      tiempo_total REAL DEFAULT 0,
      puntuacion_total INTEGER DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      UNIQUE(usuario_id, fecha)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla progreso_diario:', err.message);
    } else {
      console.log('✅ Tabla progreso_diario creada correctamente');
    }
  });

  // Tabla de logros
  db.run(`
    CREATE TABLE IF NOT EXISTS logros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo_logro TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      fecha_obtenido DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla logros:', err.message);
    } else {
      console.log('✅ Tabla logros creada correctamente');
    }
  });

  // Crear índices para mejorar el rendimiento
  db.run(`CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo)`, (err) => {
    if (err) {
      console.error('❌ Error creando índice usuarios:', err.message);
    } else {
      console.log('✅ Índice usuarios creado correctamente');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_actividades_usuario ON actividades(usuario_id)`, (err) => {
    if (err) {
      console.error('❌ Error creando índice actividades:', err.message);
    } else {
      console.log('✅ Índice actividades creado correctamente');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades(fecha_hora)`, (err) => {
    if (err) {
      console.error('❌ Error creando índice fecha actividades:', err.message);
    } else {
      console.log('✅ Índice fecha actividades creado correctamente');
    }
  });

  // Insertar datos de ejemplo (opcional)
  db.run(`
    INSERT OR IGNORE INTO usuarios (nombre, correo, edad) VALUES 
    ('Mateo Ejemplo', 'mateo@ejemplo.com', 8),
    ('Ana Ejemplo', 'ana@ejemplo.com', 10)
  `, (err) => {
    if (err) {
      console.error('❌ Error insertando datos de ejemplo:', err.message);
    } else {
      console.log('✅ Datos de ejemplo insertados correctamente');
    }
  });

  console.log('🎉 Base de datos inicializada correctamente!');
  console.log('📁 Ubicación:', dbPath);
});

// Cerrar la conexión
db.close((err) => {
  if (err) {
    console.error('❌ Error cerrando la base de datos:', err.message);
  } else {
    console.log('🔒 Conexión a la base de datos cerrada');
  }
}); 