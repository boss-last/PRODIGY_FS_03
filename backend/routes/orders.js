const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, addOrderItems);
router.route('/my').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/cancel').post(protect, cancelOrder);

module.exports = router;
