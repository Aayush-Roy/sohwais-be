const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller.js');

// Admin routes
router.post('/create', couponController.createCoupon);
router.get('/all', couponController.getAllCoupons);
router.delete('/:id', couponController.deleteCoupon);

// User routes
router.post('/apply-coupon', couponController.applyCoupon);

module.exports = router;
