const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', orderController.create);
router.get('/list', orderController.list);
router.get('/:orderId', orderController.getById);
router.put('/:orderId', orderController.update);
router.delete('/:orderId', orderController.delete);

module.exports = router;