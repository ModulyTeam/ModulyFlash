const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

console.log('Variables de entorno:', {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET ? 'Definido' : 'No definido'
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/banks', require('./routes/bankRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// Ruta para el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
    // Enviar el index.html para todas las rutas que no sean API
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

const PORT = process.env.PORT || 5500;

// Conectar a MongoDB antes de iniciar el servidor
connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al iniciar el servidor:', err);
        process.exit(1);
    });

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});