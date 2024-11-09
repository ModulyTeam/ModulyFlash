const mongoose = require('mongoose');
const User = require('../models/User');
const Bank = require('../models/Bank');
const Document = require('../models/Document');
const Portfolio = require('../models/Portfolio');

async function initializeDatabase() {
    try {
        // Verificar si las colecciones existen
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // Crear colecciones si no existen
        if (!collectionNames.includes('users')) {
            await User.createCollection();
            console.log('Colección de usuarios creada');
        }

        if (!collectionNames.includes('banks')) {
            await Bank.createCollection();
            console.log('Colección de bancos creada');
        }

        if (!collectionNames.includes('documents')) {
            await Document.createCollection();
            console.log('Colección de documentos creada');
        }

        if (!collectionNames.includes('portfolios')) {
            await Portfolio.createCollection();
            console.log('Colección de carteras creada');
        }

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    }
}

module.exports = initializeDatabase; 