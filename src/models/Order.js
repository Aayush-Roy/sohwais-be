// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   finalPrice: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   size: String,
//   color: String,
//   image: String
// });

// const orderSchema = new mongoose.Schema({
//   orderId: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   razorpayOrderId: {
//     type: String,
//     required: true
//   },
//   razorpayPaymentId: String,
//   razorpaySignature: String,
  
//   customer: {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true
//     },
//     mobile: {
//       type: String,
//       required: true,
//       trim: true
//     }
//   },
  
//   shippingAddress: {
//     addressLine1: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     addressLine2: {
//       type: String,
//       trim: true
//     },
//     city: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     state: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     pincode: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     country: {
//       type: String,
//       default: 'India',
//       trim: true
//     }
//   },
  
//   items: [orderItemSchema],
  
//   subtotal: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   shippingCharge: {
//     type: Number,
//     default: 0
//   },
//   tax: {
//     type: Number,
//     default: 0
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
  
//   status: {
//     type: String,
//     enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'],
//     default: 'pending'
//   },
  
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'completed', 'failed', 'refunded'],
//     default: 'pending'
//   },
  
//   notes: String,
  
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Generate order ID
// orderSchema.pre('save', function(next) {
//   if (!this.orderId) {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 10000);
//     this.orderId = `SO${timestamp}${random}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  image: String
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true
    },

    razorpayOrderId: {
      type: String,
      required: true
    },
    razorpayPaymentId: String,
    razorpaySignature: String,

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      mobile: { type: String, required: true, trim: true }
    },

    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },

    items: [orderItemSchema],

    subtotal: { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'],
      default: 'pending'
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },

    notes: String
  },
  {
    timestamps: true
  }
);

// ✅ SAFE PRE-SAVE HOOK (NO async + next mix)
// orderSchema.pre('save', function (next) {
//   if (!this.orderId) {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 10000);
//     this.orderId = `SO-${timestamp}-${random}`;
//   }
//   next();
// });
// orderSchema.pre('save', function (next) {
//   if (!this.orderId) {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 10000);
//     this.orderId = `SO-${timestamp}-${random}`;
//   }
//   next();
// });
orderSchema.pre('save', function () {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderId = `SO-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
