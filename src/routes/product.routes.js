// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/product.controller');
// const { uploadProductImages } = require('../middleware/upload');

// // Create a product - supports both JSON and multipart/form-data
// router.post('/', uploadProductImages, productController.createProduct);

// // Get all products
// router.get('/', productController.getAllProducts);

// // Get single product by ID
// router.get('/:id', productController.getProductById);

// // Update product - supports both JSON and multipart/form-data
// router.put('/:id', uploadProductImages, productController.updateProduct);

// module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImages } = require('../middleware/upload');

// Create a product
router.post('/', uploadProductImages, productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Update product
router.put('/:id', uploadProductImages, productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;