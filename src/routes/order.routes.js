  const express = require('express');
  const router = express.Router();
  const orderController = require('../controllers/order.controller');

  // Create order
  router.post('/create-order', orderController.createOrder);
  router.get('/all-orders', orderController.getAllOrdres);
  // Verify payment
  router.post('/verify-payment', orderController.verifyPayment);

  // Get order details
  router.get('/:orderId', orderController.getOrderDetails);

  // Get orders by email/phone
  router.get('/user/:identifier', orderController.getUserOrders);
  router.stack.forEach(r => {
    if (r.route) {
      console.log(
        Object.keys(r.route.methods).join(',').toUpperCase(),
        r.route.path
      );
    }
  });

  module.exports = router;