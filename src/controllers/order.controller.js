// const crypto = require('crypto');
// // const razorpay = require('../config/razorpay');
// const razorpay = require("../config/razorpay");
// const Order = require('../models/Order');
// const Product = require('../models/Product');

// // Create Razorpay order
// exports.createOrder = async (req, res) => {
//   try {
//     const { 
//       items, 
//       customer, 
//       shippingAddress, 
//       subtotal, 
//       shippingCharge, 
//       tax, 
//       discount, 
//       totalAmount 
//     } = req.body;

//     // Validate items and stock
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Product ${item.name} not found`
//         });
//       }
      
//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${item.name}. Available: ${product.stock}`
//         });
//       }
//     }

//     // Create Razorpay order
//     const options = {
//       amount: totalAmount * 100, // Razorpay expects amount in paise
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//       payment_capture: 1 // Auto capture payment
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     // Create order in database
//     const order = new Order({
//       razorpayOrderId: razorpayOrder.id,
//       customer,
//       shippingAddress,
//       items,
//       subtotal,
//       shippingCharge,
//       tax,
//       discount,
//       totalAmount,
//       status: 'pending',
//       paymentStatus: 'pending'
//     });

//     await order.save();

//     res.status(200).json({
//       success: true,
//       order: {
//         id: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         orderId: order.orderId,
//         key: process.env.RAZORPAY_KEY_ID
//       }
//     });

//   } catch (error) {
//     console.error('Create order error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating order',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Verify payment
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature,
//       orderId 
//     } = req.body;

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     if (expectedSignature === razorpay_signature) {
//       // Update order in database
//       const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      
//       if (!order) {
//         return res.status(404).json({
//           success: false,
//           message: 'Order not found'
//         });
//       }

//       order.razorpayPaymentId = razorpay_payment_id;
//       order.razorpaySignature = razorpay_signature;
//       order.paymentStatus = 'completed';
//       order.status = 'processing';
//       order.updatedAt = new Date();

//       await order.save();

//       // Update product stock
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(item.productId, {
//           $inc: { stock: -item.quantity }
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully',
//         order: {
//           orderId: order.orderId,
//           status: order.status,
//           totalAmount: order.totalAmount
//         }
//       });
//     } else {
//       // Payment verification failed
//       const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//       if (order) {
//         order.paymentStatus = 'failed';
//         order.status = 'failed';
//         await order.save();
//       }

//       res.status(400).json({
//         success: false,
//         message: 'Payment verification failed'
//       });
//     }
//   } catch (error) {
//     console.error('Verify payment error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error verifying payment'
//     });
//   }
// };

// // Get order details
// exports.getOrderDetails = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const order = await Order.findOne({ 
//       $or: [
//         { orderId: orderId },
//         { razorpayOrderId: orderId }
//       ]
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order
//     });
//   } catch (error) {
//     console.error('Get order error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching order details'
//     });
//   }
// };

// // Get user orders
// exports.getUserOrders = async (req, res) => {
//   try {
//     const { identifier } = req.params; // email or phone
    
//     const orders = await Order.find({
//       $or: [
//         { 'customer.email': identifier },
//         { 'customer.mobile': identifier }
//       ]
//     }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       data: orders
//     });
//   } catch (error) {
//     console.error('Get user orders error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching user orders'
//     });
//   }
// };
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Generate internal order ID (your business order id)
 */
const generateOrderId = () => {
  return `ORD-${Date.now()}`;
};

// ===============================
// CREATE ORDER (Razorpay Order)
// ===============================
// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       items,
//       customer,
//       shippingAddress,
//       subtotal,
//       shippingCharge,
//       tax,
//       discount,
//       totalAmount
//     } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Order items are required'
//       });
//     }

//     // 🔹 Validate products & stock
//     for (const item of items) {
//       const product = await Product.findById(item.productId);

//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Product not found: ${item.productId}`
//         });
//       }

//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${product.name}`
//         });
//       }
//     }

//     // 🔹 Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: totalAmount * 100, // paise
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//       payment_capture: 1
//     });

//     // 🔹 Create DB order
//     const internalOrderId = generateOrderId();

//     const order = new Order({
//       orderId: internalOrderId,              // ✅ REQUIRED FIELD
//       razorpayOrderId: razorpayOrder.id,     // Razorpay reference
//       customer,
//       shippingAddress,
//       items,
//       subtotal,
//       shippingCharge,
//       tax,
//       discount,
//       totalAmount,
//       status: 'pending',
//       paymentStatus: 'pending'
//     });

//     await order.save();

//     return res.status(201).json({
//       success: true,
//       order: {
//         orderId: internalOrderId,
//         razorpayOrderId: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         key: process.env.RAZORPAY_KEY_ID
//       }
//     });

//   } catch (error) {
//     console.error('Create order error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to create order',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.getAllOrdres = async(req,res)=>{
  try{
    const orders = await Order.find({});
    return res.status(200).json({
      ordrers:orders,
    })
  }catch(err){
    return res.status(500).json({
      error:"Failed to Fetch Orders",
      message:err.message,
    })
  }
}
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      customer,
      shippingAddress,
      subtotal,
      shippingCharge,
      tax,
      discount,
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // 🔹 Validate products & stock
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }
    }

    // 🔹 MAP ITEMS (🔥 MAIN FIX 🔥)
    const mappedItems = items.map(item => {
      const discountAmount = item.discount
        ? Math.round((item.price * item.discount) / 100)
        : 0;

      const finalUnitPrice = item.price - discountAmount;
      const finalPrice = finalUnitPrice * item.quantity;

      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        discount: discountAmount,   // ₹ value
        finalPrice,                 // quantity aware
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      };
    });

    // 🔹 Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    // 🔹 Create DB order
    const internalOrderId = generateOrderId();

    const order = new Order({
      orderId: internalOrderId,
      razorpayOrderId: razorpayOrder.id,
      customer,
      shippingAddress,
      items: mappedItems,          // ✅ FIXED
      subtotal,
      shippingCharge,
      tax,
      discount,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    return res.status(201).json({
      success: true,
      order: {
        orderId: internalOrderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===============================
// VERIFY PAYMENT
// ===============================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // 🔹 Update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'completed';
    order.status = 'processing';

    await order.save();

    // 🔹 Reduce stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        totalAmount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

// ===============================
// GET ORDER DETAILS
// ===============================
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { orderId },
        { razorpayOrderId: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

// ===============================
// GET USER ORDERS
// ===============================
exports.getUserOrders = async (req, res) => {
  try {
    const { identifier } = req.params; // email or phone

    const orders = await Order.find({
      $or: [
        { 'customer.email': identifier },
        { 'customer.mobile': identifier }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user orders'
    });
  }
};

