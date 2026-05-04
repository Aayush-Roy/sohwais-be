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
    
    console.log("TYPE RAW:", coupon.discountType);
console.log("TYPE CLEAN:", coupon.discountType.trim().toLowerCase());
    if (coupon.discountType.toLowerCase() === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      console.log(discount);
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

// exports.createCoupon = async (req, res) => {
//   try {
//     const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit } = req.body;

//     const existingCoupon = await Coupon.findOne({ code });
//     if (existingCoupon) {
//       return res.status(400).json({ success: false, message: "Coupon code already exists" });
//     }

//     const coupon = new Coupon({
//       code,
//       discountType,
//       discountValue,
//       minOrderAmount,
//       maxDiscount,
//       expiryDate,
//       usageLimit
//     });

//     await coupon.save();

//     return res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
exports.createCoupon = async (req, res) => {
  try {
    let {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit
    } = req.body;

    // 🔥 Basic validation
    if (!code || !discountType || discountValue == null || !expiryDate || !usageLimit) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // 🔥 Normalize values
    code = code.trim().toUpperCase();
    discountType = discountType.toLowerCase();

    discountValue = Number(discountValue);
    minOrderAmount = Number(minOrderAmount) || 0;
    maxDiscount = Number(maxDiscount) || 0;
    usageLimit = Number(usageLimit);

    // ❌ Invalid number check
    if (isNaN(discountValue) || isNaN(usageLimit)) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values"
      });
    }

    // 🔥 Discount validation
    if (discountType.toLowerCase() === "percentage") {
      if (discountValue <= 0 || discountValue > 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage must be between 1 and 100"
        });
      }
    }

    if (discountType === "flat") {
      if (discountValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Flat discount must be greater than 0"
        });
      }
    }

    // 🔥 Expiry validation
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future"
      });
    }

    // 🔥 Check duplicate
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    // ✅ Create coupon
    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate: expiry,
      usageLimit,
      usedCount: 0,
      usedBy: []
    });

    await coupon.save();

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    });

  } catch (err) {
    console.error("Create Coupon Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
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