const mongoose = require('mongoose');
const initializeDatabase = require('./init');

// Agregar esta línea para suprimir la advertencia
mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB conectado...');
        
        // Inicializar la base de datos
        await initializeDatabase();
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB; 