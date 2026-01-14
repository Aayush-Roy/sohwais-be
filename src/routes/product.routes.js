// // // const express = require('express');
// // // const router = express.Router();
// // // const productController = require('../controllers/product.controller');
// // // const { uploadProductImages } = require('../middleware/upload');

// // // // Create a product - supports both JSON and multipart/form-data
// // // router.post('/', uploadProductImages, productController.createProduct);

// // // // Get all products
// // // router.get('/', productController.getAllProducts);

// // // // Get single product by ID
// // // router.get('/:id', productController.getProductById);

// // // // Update product - supports both JSON and multipart/form-data
// // // router.put('/:id', uploadProductImages, productController.updateProduct);

// // // module.exports = router;
// // const express = require('express');
// // const router = express.Router();
// // const productController = require('../controllers/product.controller');
// // const { uploadProductImages } = require('../middleware/upload');

// // // Create a product
// // router.post('/', uploadProductImages, productController.createProduct);

// // // Get all products
// // router.get('/', productController.getAllProducts);

// // // Get single product by ID
// // router.get('/:id', productController.getProductById);

// // // Update product
// // router.put('/:id', uploadProductImages, productController.updateProduct);

// // // Delete product
// // router.delete('/:id', productController.deleteProduct);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/product.controller');
// const upload = require('../middleware/upload');

// // Product routes
// router.get('/collections', productController.getCollections);
// router.get('/categories', productController.getCategories);
// router.get('/featured', productController.getFeaturedProducts);
// router.get('/search', productController.searchProducts);

// // Category specific routes
// router.get('/category/:category', productController.getProductsByCategory);
// router.get('/collection/:collection', productController.getProductsByCollection);

// // CRUD operations with file upload
// router.post('/', upload.array('images', 10), productController.createProduct);
// router.get('/', productController.getAllProducts);
// router.get('/:id', productController.getProductById);
// router.put('/:id', upload.array('images', 10), productController.updateProduct);
// router.delete('/:id', productController.deleteProduct);

// module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImages, uploadSingleImage } = require('../middleware/upload');
const multer = require("multer");
// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Product routes
router.get('/collections', productController.getCollections);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);

// Category specific routes
router.get('/category/:category', productController.getProductsByCategory);
router.get('/collection/:collection', productController.getProductsByCollection);

// CRUD operations with file upload
router.post('/', uploadProductImages, handleMulterError, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', uploadProductImages, handleMulterError, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;