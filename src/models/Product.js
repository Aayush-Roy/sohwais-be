const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  
  description: {
    type: String,
    trim: true
  },
  
  variants: [{
    color: {
      type: String,
      required: [true, 'Variant color is required'],
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code']
    },
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      required: [true, 'Variant size is required']
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Variant price cannot be negative']
    }
  }],
  
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Image public_id is required']
    }
  }]
}, {
  timestamps: true
});

// Calculate final price after discount
productSchema.virtual('finalPrice').get(function() {
  return this.price - (this.price * (this.discount / 100));
});

// Add index for better query performance
productSchema.index({ name: 'text', category: 'text', description: 'text' });
productSchema.index({ status: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;