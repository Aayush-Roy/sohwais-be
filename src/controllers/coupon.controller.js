const Coupon = require("../models/Coupon");

exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal, email } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid coupon" });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon limit reached" });
    }

    // 👉 email based check (no auth case)
    if (coupon.usedBy.includes(email)) {
      return res.status(400).json({ success: false, message: "Already used" });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: "Min order not met" });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    return res.status(200).json({
      success: true,
      discount,
      finalAmount: cartTotal - discount,
      couponId: coupon._id
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit
    });

    await coupon.save();

    return res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ _id: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};