# Poke App Backend

Backend API para mi poke-app con autenticación de usuarios y gestión de favoritos. 
(Véase [poke-app](https://github.com/jesusalarcondev/poke-app))

## Características

- Autenticación de usuarios con JWT
- Registro y login de usuarios
- Gestión de perfil de usuario
- Sistema de favoritos de Pokémon (máximo 30)
- Validación de contraseñas seguras
- Imágenes de perfil predefinidas (sprites oficiales de Pokémon)
- Base de datos MongoDB con Mongoose

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcrypt** - Encriptación de contraseñas
- **dotenv** - Gestión de variables de entorno

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env`):
```env
MONGODB_URI=mongodb://localhost:27017/poke-app
JWT_SECRET=tu_palabra_secreta
JWT_EXPIRE=7d
PORT=3000
```

## Scripts Disponibles

```bash
npm start      # Inicia el servidor en modo producción
npm run dev    # Inicia el servidor con watch mode (desarrollo)
```

## Estructura del Proyecto

```
poke-app-backend/
├── config/
│   └── database.js      # Configuración de conexión a MongoDB
├── middlewares/
│   └── auth.js          # Middleware de autenticación JWT
├── models/
│   └── users.js         # Modelo de usuario de Mongoose
├── routes/
│   └── users.js        # Rutas de la API de usuarios
├── app.js              # Punto de entrada de la aplicación
├── package.json        # Dependencias y scripts
└── .env               # Variables de entorno 
```

## Endpoints de la API

### Autenticación

#### POST /api/users/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Contrasena1$",
  "name": "Juan",
  "lastname": "Pérez",
  "picture": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
}
```

**Respuesta (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "lastname": "Pérez"
  }
}
```

#### POST /api/users/login
Inicia sesión de un usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Contrasena1$"
}
```

**Respuesta (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "usuario@example.com",
    "name": "Juan",
    "lastname": "Pérez"
  }
}
```

### Perfil de Usuario

#### PUT /api/users/profile
Actualiza el perfil del usuario (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Juan Carlos",
  "lastname": "Pérez García",
  "email": "nuevo@example.com",
  "picture": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
  "password": "NuevaContrasena1$"
}
```

**Respuesta (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "nuevo@example.com",
    "name": "Juan Carlos",
    "picture": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
  }
}
```

### Favoritos

#### GET /api/users/favorites
Obtiene la lista de favoritos del usuario (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "favorites": [1, 4, 7, 25, 152]
}
```

#### PUT /api/users/favorites
Agrega o elimina un Pokémon de favoritos (toggle) - requiere autenticación.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "favorite_id": 25
}
```

**Respuesta (204):** No Content

## Modelo de Usuario

```javascript
{
  email: String (requerido, único, formato email)
  password: String (requerido, mínimo 8 caracteres, encriptado con bcrypt)
  name: String (requerido, máximo 30 caracteres)
  lastname: String (requerido, máximo 30 caracteres)
  favorites: Array<Number> (máximo 30 elementos, sin duplicados, ordenado)
  picture: String (opcional, enum de URLs de sprites oficiales de Pokémon)
  timestamps: true (createdAt, updatedAt)
}
```

## Validaciones

### Contraseña
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial

### Email
- Formato válido de email
- Convertido a minúsculas automáticamente
- Único en la base de datos

### Nombre/Apellido
- Requerido
- Máximo 30 caracteres
- Solo letras y espacios (incluyendo acentos y ñ)

### Favoritos
- Máximo 30 Pokémon
- Sin duplicados
- Ordenados numéricamente

### Imagen de Perfil
- Opcional
- Debe ser una de las URLs predefinidas de sprites oficiales de Pokémon
- Por defecto: string vacío

## Imágenes de Perfil Disponibles

Las imágenes de perfil son sprites oficiales de Pokémon de las siguientes generaciones:
- Gen 1: Bulbasaur (1), Charmander (4), Squirtle (7)
- Gen 2: Chikorita (152), Cyndaquil (155), Totodile (158)
- Gen 3: Treecko (252), Torchic (255), Mudkip (258)
- Gen 4: Turtwig (387), Chimchar (390), Piplup (393)
- Gen 5: Snivy (495), Tepig (498), Oshawott (501)
- Gen 6: Chespin (650), Fennekin (656), Froakie (722)
- Gen 7: Rowlet (722), Litten (725), Popplio (728)
- Gen 8: Grookey (810), Scorbunny (813), Sobble (816)
- Gen 9: Sprigatito (906), Fuecoco (909), Quaxly (912)

## Seguridad

- Contraseñas encriptadas con bcrypt (salt rounds: 10)
- Autenticación con JWT tokens
- Middleware de autenticación en rutas protegidas
- Validación de datos de entrada
- Variables de entorno para datos sensibles

## Desarrollo

El servidor se ejecuta por defecto en el puerto 3000, pero puede configurarse con la variable de entorno `PORT`.

Para iniciar en modo desarrollo con auto-reload:
```bash
npm run dev
```

## Licencia

ISC


## 👨‍💻 Autor

**Jesús Alarcón**
- GitHub: [@jesusalarcondev](https://github.com/jesusalarcondev)
- Portfolio: [jesusmanuelalarcon.com](https://www.jesusmanuelalarcon.com)

## ⚠️ Disclaimer

**Pokémon®** es una marca registrada propiedad de Nintendo, Creatures Inc., y GAME FREAK Inc. 

Este proyecto **PokeApp** es una aplicación web desarrollada con fines **únicamente educativos** como parte de un portafolio de desarrollo web y para demostrar habilidades en frontend y backend development.
