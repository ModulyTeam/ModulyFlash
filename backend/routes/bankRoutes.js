const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', bankController.createBank);
router.get('/', bankController.getBanks);
router.put('/:id', bankController.updateBank);
router.delete('/:id', bankController.deleteBank);

module.exports = router; 