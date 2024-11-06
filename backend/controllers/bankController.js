const Bank = require('../models/Bank');

exports.createBank = async (req, res) => {
  try {
    const bank = new Bank({
      ...req.body,
      userId: req.user.userId
    });
    await bank.save();
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBanks = async (req, res) => {
  try {
    const banks = await Bank.find({ userId: req.user.userId });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBank = async (req, res) => {
  try {
    const bank = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!bank) return res.status(404).json({ message: 'Banco no encontrado' });
    res.json(bank);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!bank) return res.status(404).json({ message: 'Banco no encontrado' });
    res.json({ message: 'Banco eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 