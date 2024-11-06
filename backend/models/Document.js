const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['FACTURA', 'LETRA']
  },
  description: String,
  emissionDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank'
  },
  currency: {
    type: String,
    required: true,
    enum: ['PEN', 'USD']
  },
  tcea: {
    type: Number,
    required: true
  },
  unit: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema); 