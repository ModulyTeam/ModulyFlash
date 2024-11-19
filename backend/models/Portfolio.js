const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },
    type: {
        type: String,
        enum: ['FACTURA', 'LETRA', 'MIXTA'],
        required: true
    },
    currency: {
        type: String,
        enum: ['PEN', 'USD'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_PROCESO', 'COMPLETADA'],
        default: 'PENDIENTE'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discountedAmount: {
        type: Number,
        required: true
    },
    interestAmount: {
        type: Number,
        required: true
    },
    discountDate: {
        type: Date,
        required: true
    },
    documents: [{
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true
        },
        originalAmount: Number,
        discountedAmount: Number
    }],
    pdfUrl: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema); 