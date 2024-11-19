const Portfolio = require('../models/Portfolio');
const fs = require('fs').promises;
const path = require('path');

exports.createPortfolio = async (req, res) => {
    try {
        if (!req.files || !req.files.pdf) {
            throw new Error('No se proporcionó el archivo PDF');
        }

        const {
            bankId,
            type,
            currency,
            totalAmount,
            discountedAmount,
            interestAmount,
            discountDate,
            documents
        } = req.body;

        console.log('Documentos recibidos:', documents); // Para debug

        // Guardar el PDF
        const pdfFile = req.files.pdf;
        const pdfName = `portfolio_${Date.now()}.pdf`;
        const pdfPath = path.join(__dirname, '../uploads/portfolios', pdfName);
        
        await pdfFile.mv(pdfPath);

        // Parsear los documentos y validar que cada uno tenga su documentId
        const parsedDocuments = JSON.parse(documents);
        
        if (!parsedDocuments.every(doc => doc.documentId)) {
            throw new Error('Todos los documentos deben tener un documentId');
        }

        const portfolio = new Portfolio({
            userId: req.user.userId,
            bankId,
            type,
            currency,
            totalAmount: parseFloat(totalAmount),
            discountedAmount: parseFloat(discountedAmount),
            interestAmount: parseFloat(interestAmount),
            discountDate,
            documents: parsedDocuments,
            pdfUrl: `/uploads/portfolios/${pdfName}`,
            status: 'PENDIENTE'
        });

        await portfolio.save();
        res.status(201).json(portfolio);
    } catch (error) {
        console.error('Error al crear cartera:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.user.userId })
            .populate('bankId', 'name')
            .populate('documents.documentId', 'code type')
            .sort('-createdAt');
        
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user.userId
        })
        .populate('bankId', 'name')
        .populate('documents.documentId', 'code type emissionDate dueDate currency tcea unit unitPrice status description')
        .select('-userId -__v');

        if (!portfolio) {
            return res.status(404).json({ message: 'Cartera no encontrada' });
        }

        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePortfolioStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const portfolio = await Portfolio.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            { status },
            { new: true }
        ).populate('bankId', 'name')
         .populate('documents.documentId', 'code type');

        if (!portfolio) {
            return res.status(404).json({ message: 'Cartera no encontrada' });
        }

        res.json(portfolio);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.downloadPdf = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Cartera no encontrada' });
        }

        const pdfPath = path.join(__dirname, '..', portfolio.pdfUrl);
        res.download(pdfPath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Cartera no encontrada' });
        }

        // Eliminar el archivo PDF
        const pdfPath = path.join(__dirname, '..', portfolio.pdfUrl);
        try {
            await fs.unlink(pdfPath);
        } catch (error) {
            console.error('Error al eliminar archivo PDF:', error);
        }

        // Eliminar el registro de la base de datos
        await portfolio.remove();
        res.json({ message: 'Cartera eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePdf = async (req, res) => {
    try {
        if (!req.files || !req.files.pdf) {
            throw new Error('No se proporcionó el archivo PDF');
        }

        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Cartera no encontrada' });
        }

        if (!['APROBADA', 'COMPLETADA'].includes(portfolio.status)) {
            return res.status(400).json({ 
                message: 'Solo se puede actualizar el PDF de carteras aprobadas o completadas' 
            });
        }

        // Eliminar el PDF anterior
        const oldPdfPath = path.join(__dirname, '..', portfolio.pdfUrl);
        try {
            await fs.unlink(oldPdfPath);
        } catch (error) {
            console.error('Error al eliminar PDF anterior:', error);
        }

        // Guardar el nuevo PDF
        const pdfFile = req.files.pdf;
        const pdfName = `portfolio_${Date.now()}.pdf`;
        const pdfPath = path.join(__dirname, '../uploads/portfolios', pdfName);
        
        await pdfFile.mv(pdfPath);

        // Actualizar la URL en la base de datos
        portfolio.pdfUrl = `/uploads/portfolios/${pdfName}`;
        await portfolio.save();

        res.json({ 
            message: 'PDF actualizado exitosamente',
            newPdfUrl: portfolio.pdfUrl
        });
    } catch (error) {
        console.error('Error al actualizar PDF:', error);
        res.status(500).json({ message: error.message });
    }
}; 