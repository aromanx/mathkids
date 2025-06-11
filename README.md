# 🚀 MathKids Backend API

API REST para la aplicación educativa MathKids, desarrollada con Node.js, Express y SQLite.

## 📋 Características

- ✅ **RESTful API** con Express.js
- ✅ **Base de datos SQLite** para persistencia
- ✅ **CORS habilitado** para aplicaciones móviles
- ✅ **Validación de datos** completa
- ✅ **Manejo de errores** robusto
- ✅ **Logging** con Morgan
- ✅ **Seguridad** con Helmet
- ✅ **Sistema de logros** automático
- ✅ **Estadísticas** detalladas

## 🏗️ Estructura del Proyecto

```
backend/
├── server.js              # Servidor principal
├── database.js            # Configuración de base de datos
├── init-database.js       # Script de inicialización
├── package.json           # Dependencias
├── routes/                # Rutas de la API
│   ├── usuarios.js        # Gestión de usuarios
│   ├── actividades.js     # Gestión de actividades
│   ├── progreso.js        # Gestión de progreso
│   └── logros.js          # Gestión de logros
└── mathkids.db           # Base de datos SQLite (se crea automáticamente)
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar o navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Inicializar la base de datos:**
   ```bash
   npm run init-db
   ```

4. **Iniciar el servidor:**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

## 🌐 Endpoints de la API

### Salud del Servidor
- `GET /api/health` - Verificar estado del servidor

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `GET /api/usuarios/correo/:correo` - Obtener usuario por correo
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Actividades
- `GET /api/actividades` - Obtener todas las actividades
- `GET /api/actividades/usuario/:correo` - Obtener actividades de un usuario
- `GET /api/actividades/:id` - Obtener actividad por ID
- `POST /api/actividades` - Crear nueva actividad
- `GET /api/actividades/estadisticas/:correo` - Obtener estadísticas del usuario
- `DELETE /api/actividades/:id` - Eliminar actividad

### Progreso
- `GET /api/progreso/usuario/:correo` - Obtener progreso del usuario
- `POST /api/progreso` - Registrar progreso diario

### Logros
- `GET /api/logros/usuario/:correo` - Obtener logros del usuario
- `POST /api/logros` - Crear nuevo logro
- `POST /api/logros/verificar` - Verificar y otorgar logros automáticamente

## 📊 Base de Datos

### Tablas

#### usuarios
- `id` (INTEGER PRIMARY KEY)
- `nombre` (TEXT NOT NULL)
- `correo` (TEXT UNIQUE NOT NULL)
- `edad` (INTEGER NOT NULL)
- `fecha_registro` (DATETIME)
- `fecha_actualizacion` (DATETIME)

#### actividades
- `id` (INTEGER PRIMARY KEY)
- `usuario_id` (INTEGER FOREIGN KEY)
- `correo_usuario` (TEXT NOT NULL)
- `tipo_ejercicio` (TEXT NOT NULL)
- `puntuacion` (INTEGER DEFAULT 0)
- `tiempo_promedio` (REAL DEFAULT 0)
- `precision` (REAL DEFAULT 0)
- `ejercicios_completados` (INTEGER DEFAULT 0)
- `ejercicios_totales` (INTEGER DEFAULT 0)
- `nivel_alcanzado` (INTEGER DEFAULT 1)
- `estrellas_obtenidas` (INTEGER DEFAULT 0)
- `fecha_hora` (DATETIME)

#### progreso_diario
- `id` (INTEGER PRIMARY KEY)
- `usuario_id` (INTEGER FOREIGN KEY)
- `fecha` (DATE)
- `ejercicios_completados` (INTEGER DEFAULT 0)
- `tiempo_total` (REAL DEFAULT 0)
- `puntuacion_total` (INTEGER DEFAULT 0)

#### logros
- `id` (INTEGER PRIMARY KEY)
- `usuario_id` (INTEGER FOREIGN KEY)
- `tipo_logro` (TEXT NOT NULL)
- `descripcion` (TEXT NOT NULL)
- `fecha_obtenido` (DATETIME)

## 🎯 Ejemplos de Uso

### Crear un usuario
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mateo",
    "correo": "mateo@ejemplo.com",
    "edad": 8
  }'
```

### Registrar una actividad
```bash
curl -X POST http://localhost:3000/api/actividades \
  -H "Content-Type: application/json" \
  -d '{
    "correo_usuario": "mateo@ejemplo.com",
    "tipo_ejercicio": "Secuencias Numéricas",
    "puntuacion": 1500,
    "tiempo_promedio": 45.5,
    "precision": 85.0,
    "ejercicios_completados": 15,
    "ejercicios_totales": 15,
    "nivel_alcanzado": 5,
    "estrellas_obtenidas": 3
  }'
```

### Obtener estadísticas de un usuario
```bash
curl http://localhost:3000/api/actividades/estadisticas/mateo@ejemplo.com
```

## 🔧 Configuración

### Variables de Entorno
```bash
PORT=3000                    # Puerto del servidor
NODE_ENV=development         # Entorno (development/production)
```

### CORS
La API está configurada para aceptar peticiones desde:
- `http://localhost:19006` (Expo Go)
- `http://localhost:19000` (Expo Web)
- `http://localhost:3000` (Desarrollo web)

## 🚀 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm run init-db` - Inicializar la base de datos

## 📝 Logs

El servidor utiliza Morgan para logging. Los logs incluyen:
- Método HTTP
- URL de la petición
- Código de estado
- Tiempo de respuesta
- Tamaño de la respuesta

## 🔒 Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Control de acceso de origen cruzado
- **Validación**: Validación de datos de entrada
- **Sanitización**: Limpieza de datos

## 🐛 Troubleshooting

### Error de conexión a la base de datos
```bash
# Verificar que SQLite esté instalado
sqlite3 --version

# Recrear la base de datos
rm mathkids.db
npm run init-db
```

### Error de puerto en uso
```bash
# Cambiar puerto en server.js o usar variable de entorno
PORT=3001 npm start
```

### Error de CORS
Verificar que la URL de origen esté en la configuración de CORS en `server.js`.

## 📞 Soporte

Para reportar problemas o solicitar características:
1. Revisar los logs del servidor
2. Verificar la conectividad de red
3. Comprobar la configuración de CORS
4. Validar el formato de los datos enviados

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles. 