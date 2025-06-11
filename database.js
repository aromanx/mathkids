const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuración de la base de datos
const dbPath = path.join(__dirname, 'mathkids.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos MathKids');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Función para ejecutar consultas con promesas
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

// Función para obtener una fila
const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Función para obtener múltiples filas
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Función para verificar si la base de datos está lista
const checkDatabase = async () => {
  try {
    const result = await getRow('SELECT 1 as test');
    return result && result.test === 1;
  } catch (error) {
    console.error('Error verificando la base de datos:', error);
    return false;
  }
};

// Función para cerrar la conexión
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  runQuery,
  getRow,
  getAll,
  checkDatabase,
  closeDatabase
}; 