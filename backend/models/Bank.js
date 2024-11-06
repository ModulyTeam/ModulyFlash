const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discountRate: {
    type: Number,
    required: true
  },
  acceptedCurrencies: [{
    type: String,
    enum: ['PEN', 'USD', 'BOTH'],
    default: 'PEN'
  }],
  accountNumber: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Bank', bankSchema); 