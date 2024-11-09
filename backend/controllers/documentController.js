const Document = require('../models/Document');
const Bank = require('../models/Bank');

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
        const { selectedDate, documents, calculationType, daysInYear, bankId } = req.body;

        // Obtener el banco seleccionado una sola vez
        const bank = await Bank.findById(bankId);
        if (!bank) {
            throw new Error('Banco no encontrado');
        }

        const calculations = await Promise.all(documents.map(async (docData) => {
            const doc = await Document.findOne({
                _id: docData.documentId,
                userId: req.user.userId
            });

            if (!doc) throw new Error(`Documento no encontrado: ${docData.documentId}`);

            const originalAmount = doc.unit * doc.unitPrice;
            const daysToMaturity = Math.floor((new Date(doc.dueDate) - new Date(doc.emissionDate)) / (1000 * 60 * 60 * 24));
            const daysToSelected = Math.floor((new Date(selectedDate) - new Date(doc.emissionDate)) / (1000 * 60 * 60 * 24));
            const daysFromSelectedToMaturity = Math.floor((new Date(doc.dueDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24));

            // Usar la tasa de descuento del banco seleccionado
            const discountRate = bank.discountRate;

            // Cálculo del valor futuro usando TCEA
            const futureValue = originalAmount * Math.pow(1 + (doc.tcea/100), daysToMaturity/daysInYear);
            const futureValueAtSelected = originalAmount * Math.pow(1 + (doc.tcea/100), daysToSelected/daysInYear);
            
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
            
            // Cálculo del interés adelantado
            const interesAdelantado = amountToDiscount - discountedValue;
            
            return {
                documentCode: doc.code,
                bank: bank.name,
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
                emissionDate: doc.emissionDate,
                dueDate: doc.dueDate,
                interesAdelantado
            };
        }));

        // Calcular totales para la descripción
        const totalDiscounted = calculations.reduce((sum, doc) => sum + doc.discountedValue, 0);
        const totalInteresAdelantado = calculations.reduce((sum, doc) => sum + doc.interesAdelantado, 0);
        const currency = calculations[0].currency;
        const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';

        // Generar descripción del pago
        const paymentDescription = `
            ACUERDO DE DESCUENTO DE CARTERA

            Por medio del presente documento, se establece el siguiente acuerdo de descuento entre el Cliente y ${bank.name}:

            1. OPERACIÓN DE DESCUENTO:
               El Cliente cede al Banco ${bank.name} el derecho de cobro de ${calculations.length} documento(s) financiero(s) 
               por un valor nominal total de ${currencySymbol}${totalDiscounted.toFixed(2)}, 
               que serán cobrados por el banco en sus respectivas fechas de vencimiento.

            2. PRÉSTAMO A OTORGAR:
               El Banco ${bank.name} otorgará al Cliente un préstamo por ${currencySymbol}${totalDiscounted.toFixed(2)}
               que representa el valor actual de los documentos calculado a una tasa de descuento del ${bank.discountRate}% anual.
               Este monto será depositado en la cuenta del Cliente en la fecha acordada (${new Date(selectedDate).toLocaleDateString()}).

            3. INTERESES ADELANTADOS:
               El monto de ${currencySymbol}${totalInteresAdelantado.toFixed(2)} representa los intereses que el banco retiene 
               por adelantado, calculados desde la fecha de desembolso hasta el vencimiento de cada documento.

            4. DOCUMENTOS INCLUIDOS:
               La presente cartera incluye documentos con vencimientos entre 
               ${new Date(Math.min(...calculations.map(doc => new Date(doc.dueDate)))).toLocaleDateString()}
               y ${new Date(Math.max(...calculations.map(doc => new Date(doc.dueDate)))).toLocaleDateString()}.

            5. COMPROMISO DE PAGO:
               El Cliente confirma que los documentos son legítimos y que sus deudores realizarán el pago 
               en las fechas de vencimiento establecidas. En caso de incumplimiento por parte de los deudores, 
               el Cliente se compromete a reembolsar al banco el valor nominal de los documentos más los gastos 
               correspondientes.

            RESUMEN DE LA OPERACIÓN:
            • Valor Nominal Total: ${currencySymbol}${totalDiscounted.toFixed(2)}
            • Intereses Adelantados: ${currencySymbol}${totalInteresAdelantado.toFixed(2)}
            • Monto del Préstamo: ${currencySymbol}${totalDiscounted.toFixed(2)}
            • Tasa de Descuento Anual: ${bank.discountRate}%
            • Fecha de Desembolso: ${new Date(selectedDate).toLocaleDateString()}
        `;

        res.json({
            details: calculations,
            selectedDate,
            calculationType,
            paymentDescription
        });
    } catch (error) {
        console.error('Error en calculatePortfolio:', error);
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