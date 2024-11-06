const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    // URI directa para asegurar la conexión
    const mongoURI = 'mongodb://localhost:27017/sistema-financiero';
    
    console.log('Intentando conectar a MongoDB en:', mongoURI);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB conectado exitosamente');

  } catch (error) {
    console.error('Error detallado conectando a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 