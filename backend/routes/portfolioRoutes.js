const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', portfolioController.createPortfolio);
router.get('/', portfolioController.getPortfolios);
router.get('/:id', portfolioController.getPortfolio);
router.put('/:id/status', portfolioController.updatePortfolioStatus);
router.get('/:id/download', portfolioController.downloadPdf);
router.delete('/:id', portfolioController.deletePortfolio);
router.put('/:id/updatePdf', portfolioController.updatePdf);

module.exports = router; 