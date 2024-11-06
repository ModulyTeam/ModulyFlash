const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.post('/calculate-portfolio', documentController.calculatePortfolio);
router.delete('/:id', documentController.deleteDocument);

module.exports = router; 