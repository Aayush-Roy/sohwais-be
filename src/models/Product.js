// // const mongoose = require('mongoose');

// // const productSchema = new mongoose.Schema({
// //   name: {
// //     type: String,
// //     required: [true, 'Product name is required'],
// //     trim: true,
// //     maxlength: [200, 'Product name cannot exceed 200 characters']
// //   },
  
// //   category: {
// //     type: String,
// //     required: [true, 'Category is required'],
// //     trim: true
// //   },
  
// //   price: {
// //     type: Number,
// //     required: [true, 'Price is required'],
// //     min: [0, 'Price cannot be negative']
// //   },
  
// //   discount: {
// //     type: Number,
// //     default: 0,
// //     min: [0, 'Discount cannot be negative'],
// //     max: [100, 'Discount cannot exceed 100%']
// //   },
  
// //   stock: {
// //     type: Number,
// //     required: [true, 'Stock is required'],
// //     min: [0, 'Stock cannot be negative'],
// //     default: 0
// //   },
  
// //   status: {
// //     type: String,
// //     enum: ['Active', 'Inactive'],
// //     default: 'Active'
// //   },
  
// //   description: {
// //     type: String,
// //     trim: true
// //   },
  
// //   variants: [{
// //     color: {
// //       type: String,
// //       required: [true, 'Variant color is required'],
// //       match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code']
// //     },
// //     size: {
// //       type: String,
// //       enum: ['S', 'M', 'L', 'XL', 'XXL'],
// //       required: [true, 'Variant size is required']
// //     },
// //     price: {
// //       type: Number,
// //       required: [true, 'Variant price is required'],
// //       min: [0, 'Variant price cannot be negative']
// //     }
// //   }],
  
// //   images: [{
// //     url: {
// //       type: String,
// //       required: [true, 'Image URL is required']
// //     },
// //     public_id: {
// //       type: String,
// //       required: [true, 'Image public_id is required']
// //     }
// //   }]
// // }, {
// //   timestamps: true
// // });

// // // Calculate final price after discount
// // productSchema.virtual('finalPrice').get(function() {
// //   return this.price - (this.price * (this.discount / 100));
// // });

// // // Add index for better query performance
// // productSchema.index({ name: 'text', category: 'text', description: 'text' });
// // productSchema.index({ status: 1, createdAt: -1 });

// // const Product = mongoose.model('Product', productSchema);

// // module.exports = Product;
// const mongoose = require('mongoose');

// const variantSchema = new mongoose.Schema({
//   color: {
//     type: String,
//     required: [true, 'Variant color is required']
//   },
//   size: {
//     type: String,
//     required: [true, 'Variant size is required']
//   },
//   price: {
//     type: Number,
//     required: [true, 'Variant price is required'],
//     min: [0, 'Price must be positive']
//   }
// });

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['Men', 'Women', 'Unisex']
//   },
//   collection: {
//     type: String,
//     required: [true, 'Collection is required'],
//     enum: [
//       'Madhubani Collection',
//       'Sujini Collection',
//       'Marble Collection',
//       'Nakashi Collection',
//       'Majestic Linen',
//       'The Batik Archive',
//       'Traditional',
//       'Modern',
//       'Festival Special',
//       'Wedding Collection',
//       'Daily Wear'
//     ]
//   },
//   subCategory: {
//     type: String,
//     required: [true, 'Sub-category is required'],
//     enum: {
//       values: [
//         // Men's Wear
//         'Kurta', 'Sherwani', 'Dhoti', 'Pajama', 'Jacket', 'Shawl', 'Turban',
//         // Women's Wear
//         'Saree', 'Lehenga', 'Salwar Suit', 'Kurti', 'Dupatta', 'Blouse', 'Ghagra',
//         // Unisex
//         'Stole', 'Scarf', 'Bag', 'Jewelry', 'Footwear', 'Accessories'
//       ],
//       message: '{VALUE} is not a valid sub-category'
//     }
//   },
//   price: {
//     type: Number,
//     required: [true, 'Price is required'],
//     min: [0, 'Price must be positive']
//   },
//   discount: {
//     type: Number,
//     default: 0,
//     min: [0, 'Discount cannot be negative'],
//     max: [100, 'Discount cannot exceed 100%']
//   },
//   stock: {
//     type: Number,
//     required: [true, 'Stock quantity is required'],
//     min: [0, 'Stock cannot be negative']
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'Inactive', 'Out of Stock', 'Coming Soon'],
//     default: 'Active'
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   features: {
//     type: [String],
//     default: []
//   },
//   variants: [variantSchema],
//   images: [{
//     url: {
//       type: String,
//       required: true
//     },
//     public_id: {
//       type: String,
//       required: true
//     },
//     isPrimary: {
//       type: Boolean,
//       default: false
//     }
//   }],
//   tags: [String],
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   reviewsCount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// // Calculate final price (after discount)
// productSchema.virtual('finalPrice').get(function() {
//   return this.price - (this.price * this.discount / 100);
// });

// // Index for better query performance
// productSchema.index({ category: 1, collection: 1, subCategory: 1 });
// productSchema.index({ status: 1, createdAt: -1 });

// module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: [true, 'Variant color is required']
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL'],
    required: [true, 'Variant size is required']
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
    min: [0, 'Price must be positive']
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Men', 'Women', 'Unisex']
  },
  collection: {
    type: String,
    required: [true, 'Collection is required'],
    enum: [
      'Madhubani Collection',
      'Sujini Collection',
      'Marble Collection',
      'Nakashi Collection',
      'Majestic Linen',
      'The Batik Archive',
      'Traditional',
      'Modern',
      'Festival Special',
      'Wedding Collection',
      'Daily Wear'
    ]
  },
  subCategory: {
    type: String,
    required: [true, 'Sub-category is required'],
    enum: {
      values: [
        // Men's Wear
        'Kurta', 'Sherwani', 'Dhoti', 'Pajama', 'Jacket', 'Shawl', 'Turban',
        // Women's Wear
        'Saree', 'Lehenga', 'Salwar Suit', 'Kurti', 'Dupatta', 'Blouse', 'Ghagra',
        // Unisex
        'Stole', 'Scarf', 'Bag', 'Jewelry', 'Footwear', 'Accessories'
      ],
      message: '{VALUE} is not a valid sub-category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Out of Stock', 'Coming Soon'],
    default: 'Active'
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  variants: [variantSchema],
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate final price (after discount)
productSchema.virtual('finalPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Index for better query performance
productSchema.index({ category: 1, collection: 1, subCategory: 1 });
productSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);