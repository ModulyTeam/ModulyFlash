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
            ref: 'Document'
        },
        originalAmount: Number,
        discountedAmount: Number
    }],
    pdfUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

portfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema); 