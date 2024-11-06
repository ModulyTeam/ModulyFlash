const Document = require('../models/Document');

exports.createDocument = async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      userId: req.user.userId
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { type, currency, bankId } = req.query;
    const query = { userId: req.user.userId };
    
    if (type) query.type = type;
    if (currency) query.currency = currency;
    if (bankId) query.bankId = bankId;
    
    const documents = await Document.find(query)
      .populate('bankId', 'name discountRate currency')
      .exec();

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.calculatePortfolio = async (req, res) => {
  try {
    const { selectedDate, documents, calculationType, daysInYear } = req.body;

    const calculations = await Promise.all(documents.map(async (docData) => {
      const doc = await Document.findOne({
        _id: docData.documentId,
        userId: req.user.userId
      }).populate('bankId');

      if (!doc) throw new Error(`Documento no encontrado: ${docData.documentId}`);

      const originalAmount = doc.unit * doc.unitPrice;
      const daysToMaturity = Math.floor((new Date(doc.dueDate) - new Date(doc.emissionDate)) / (1000 * 60 * 60 * 24));
      const daysToSelected = Math.floor((new Date(selectedDate) - new Date(doc.emissionDate)) / (1000 * 60 * 60 * 24));
      const daysFromSelectedToMaturity = Math.floor((new Date(doc.dueDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24));
      
      // Cálculo del valor futuro usando TCEA
      const futureValue = originalAmount * Math.pow(1 + (doc.tcea/100), daysToMaturity/daysInYear);
      const futureValueAtSelected = originalAmount * Math.pow(1 + (doc.tcea/100), daysToSelected/daysInYear);
      
      // Determinar la tasa de descuento a usar
      const discountRate = doc.bankId ? doc.bankId.discountRate : docData.customDiscountRate;
      if (!discountRate && discountRate !== 0) {
        throw new Error(`Tasa de descuento no disponible para documento ${doc.code}`);
      }

      // Determinar el monto a descontar según el método seleccionado
      let amountToDiscount;
      switch(calculationType) {
        case 'original':
          amountToDiscount = originalAmount;
          break;
        case 'futureAtSelected':
          amountToDiscount = futureValueAtSelected;
          break;
        case 'future':
        default:
          amountToDiscount = futureValue;
          break;
      }

      // Cálculo del valor descontado
      const discountedValue = amountToDiscount / Math.pow(1 + (discountRate/100), daysFromSelectedToMaturity/daysInYear);
      
      return {
        documentCode: doc.code,
        bank: doc.bankId ? doc.bankId.name : 'Sin banco',
        currency: doc.currency,
        originalAmount,
        futureValue,
        futureValueAtSelected,
        discountedValue,
        amountToDiscount,
        daysToMaturity,
        daysToSelected,
        daysFromSelectedToMaturity,
        tcea: doc.tcea,
        discountRate,
        unit: doc.unit,
        unitPrice: doc.unitPrice,
        calculationType,
        daysInYear,
      };
    }));

    const totals = calculations.reduce((acc, curr) => ({
      originalAmount: acc.originalAmount + curr.originalAmount,
      futureValue: acc.futureValue + curr.futureValue,
      discountedValue: acc.discountedValue + curr.discountedValue
    }), { originalAmount: 0, futureValue: 0, discountedValue: 0 });

    res.json({
      details: calculations,
      totals,
      selectedDate,
      calculationType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    res.json({ message: 'Documento eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 