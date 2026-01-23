

  const Product = require('../models/Product');
  const configureCloudinary = require('../config/cloudinary');

  const cloudinary = configureCloudinary();

  // Helper function to process images
  const processImages = async (files, existingImages = []) => {
    const images = [...existingImages];
    
    // Add uploaded files to images array
    if (files && files.length > 0) {
      const uploadedImages = files.map(file => ({
        url: file.path,
        public_id: file.filename,
        isPrimary: images.length === 0 // First image is primary
      }));
      images.push(...uploadedImages);
    }
    
    return images;
  };

  // Helper function to process image URLs
  const processImageUrls = (imageUrls = []) => {
    return imageUrls.map((url, index) => {
      const publicIdMatch = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
      const public_id = publicIdMatch ? publicIdMatch[1] : `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        url: url,
        public_id: public_id,
        isPrimary: index === 0 // First URL image is primary
      };
    });
  };

  // Get all available collections
  exports.getCollections = async (req, res) => {
    try {
      const collections = [
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
      ];
      
      res.status(200).json({
        success: true,
        data: collections
      });
    } catch (error) {
      console.error('Get collections error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching collections'
      });
    }
  };

  // Get categories and sub-categories
  // exports.getCategories = async (req, res) => {
  //   try {
  //     const categories = {
  //       Men: ['Kurta', 'Sherwani', 'Dhoti', 'Pajama', 'Jacket', 'Shawl', 'Turban'],
  //       Women: ['Saree', 'Lehenga', 'Salwar Suit', 'Kurti', 'Dupatta', 'Blouse', 'Ghagra'],
  //       Unisex: ['Stole', 'Scarf', 'Bag', 'Jewelry', 'Footwear', 'Accessories']
  //     };
      
  //     res.status(200).json({
  //       success: true,
  //       data: categories
  //     });
  //   } catch (error) {
  //     console.error('Get categories error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Error fetching categories'
  //     });
  //   }
  // };
  exports.getCategories = async (req, res) => {
  try {
    const enumValues =
      Product.schema.path('subCategory').enumValues;

    const data = {
      Men: enumValues.filter(v =>
        [
          'Kurta',
          'Sherwani',
          'Dhoti',
          'Pajama',
          'Jacket',
          'Shawl',
          'Turban',
          'Full Sleeve Shirt',
          'Half Sleeve Shirt',
          'Short Kurta',
          'Half cuban collar Shirt'
        ].includes(v)
      ),
      Women: enumValues.filter(v =>
        [
          'Saree',
          'Lehenga',
          'Salwar Suit',
          'Kurti',
          'Dupatta',
          'Blouse',
          'Ghagra'
        ].includes(v)
      ),
      Unisex: enumValues.filter(v =>
        [
          'Stole',
          'Scarf',
          'Bag',
          'Jewelry',
          'Footwear',
          'Accessories'
        ].includes(v)
      )
    };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

  // Create a new product
  exports.createProduct = async (req, res) => {
    try {
      const {
        name,
        category,
        collection,
        subCategory,
        price,
        discount = 0,
        stock,
        status = 'Active',
        description = '',
        features = [],
        variants = [],
        tags = [],
        imageUrls = []
      } = req.body;

      // Parse arrays if they are strings
      const parseArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch {
            return [data];
          }
        }
        return [];
      };

      let parsedVariants = parseArray(variants);
      let parsedImageUrls = parseArray(imageUrls);
      let parsedFeatures = parseArray(features);
      let parsedTags = parseArray(tags);

      // Combine images from URLs and uploaded files
      let images = [];
      
      // Add images from URLs
      if (parsedImageUrls.length > 0) {
        const urlImages = processImageUrls(parsedImageUrls);
        images.push(...urlImages);
      }
      
      // Add uploaded images
      if (req.files && req.files.length > 0) {
        const uploadedImages = await processImages(req.files);
        images.push(...uploadedImages);
      }

      // Validate that we have at least one image
      if (images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one image is required (URL or file upload)'
        });
      }

      // Ensure at least one image is primary
      if (!images.some(img => img.isPrimary)) {
        images[0].isPrimary = true;
      }

      // Create product
      const product = new Product({
        name,
        category,
        collection,
        subCategory,
        price: Number(price),
        discount: Number(discount),
        stock: Number(stock),
        status,
        description,
        features: parsedFeatures,
        variants: parsedVariants,
        tags: parsedTags,
        images
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  // Get all products with filters
  exports.getAllProducts = async (req, res) => {
    try {
      const { 
        category, 
        collection, 
        subCategory, 
        status, 
        minPrice, 
        maxPrice,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (category) filter.category = category;
      if (collection) filter.collection = collection;
      if (subCategory) filter.subCategory = subCategory;
      if (status) filter.status = status;
      
      // Price range filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      
      // Tags filter
      if (tags) {
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagsArray };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');

      // Get total count for pagination
      const total = await Product.countDocuments(filter);

      res.status(200).json({
        success: true,
        count: products.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        data: products
      });
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  // Get products by category
  exports.getProductsByCategory = async (req, res) => {
    try {
      const { category } = req.params;
      const { collection, subCategory } = req.query;

      const filter = { category, status: 'Active' };
      if (collection) filter.collection = collection;
      if (subCategory) filter.subCategory = subCategory;

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .select('-__v');

      res.status(200).json({
        success: true,
        category,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products by category'
      });
    }
  };

  // Get products by collection
  exports.getProductsByCollection = async (req, res) => {
    try {
      const { collection } = req.params;
      const { category, subCategory } = req.query;
      console.log(collection);
      const filter = { collection, status: 'Active' };
      if (category) filter.category = category;
      if (subCategory) filter.subCategory = subCategory;

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .select('-__v');

      res.status(200).json({
        success: true,
        collection,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Get products by collection error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products by collection'
      });
    }
  };

  // Get single product by ID
  exports.getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id).select('-__v');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching product'
      });
    }
  };

  // Update product
  // exports.updateProduct = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const updateData = { ...req.body };

  //     // Parse arrays if they are strings
  //     const parseArray = (data) => {
  //       if (!data) return undefined;
  //       if (Array.isArray(data)) return data;
  //       if (typeof data === 'string') {
  //         try {
  //           return JSON.parse(data);
  //         } catch {
  //           return [data];
  //         }
  //       }
  //       return undefined;
  //     };

  //     if (updateData.variants) {
  //       updateData.variants = parseArray(updateData.variants);
  //     }
  //     if (updateData.imageUrls) {
  //       updateData.imageUrls = parseArray(updateData.imageUrls);
  //     }
  //     if (updateData.features) {
  //       updateData.features = parseArray(updateData.features);
  //     }
  //     if (updateData.tags) {
  //       updateData.tags = parseArray(updateData.tags);
  //     }

  //     // Find existing product
  //     const existingProduct = await Product.findById(id);
  //     if (!existingProduct) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Product not found'
  //       });
  //     }

  //     // Handle new images
  //     let images = [...existingProduct.images];
      
  //     // Add new images from URLs
  //     if (updateData.imageUrls && updateData.imageUrls.length > 0) {
  //       const urlImages = processImageUrls(updateData.imageUrls);
  //       images.push(...urlImages);
  //       delete updateData.imageUrls;
  //     }
      
  //     // Add uploaded images
  //     if (req.files && req.files.length > 0) {
  //       const uploadedImages = await processImages(req.files);
  //       images.push(...uploadedImages);
  //     }

  //     // If we have new images, update the images array
  //     if (images.length !== existingProduct.images.length || 
  //         JSON.stringify(images) !== JSON.stringify(existingProduct.images)) {
  //       updateData.images = images;
  //     }

  //     // Convert numeric fields
  //     if (updateData.price) updateData.price = Number(updateData.price);
  //     if (updateData.discount) updateData.discount = Number(updateData.discount);
  //     if (updateData.stock) updateData.stock = Number(updateData.stock);
  //     if (updateData.rating) updateData.rating = Number(updateData.rating);
  //     if (updateData.reviewsCount) updateData.reviewsCount = Number(updateData.reviewsCount);

  //     // Update product
  //     const updatedProduct = await Product.findByIdAndUpdate(
  //       id,
  //       updateData,
  //       {
  //         new: true,
  //         runValidators: true
  //       }
  //     ).select('-__v');

  //     res.status(200).json({
  //       success: true,
  //       message: 'Product updated successfully',
  //       data: updatedProduct
  //     });
  //   } catch (error) {
  //     console.error('Update product error:', error);
      
  //     if (error.name === 'ValidationError') {
  //       const errors = Object.values(error.errors).map(err => err.message);
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Validation error',
  //         errors
  //       });
  //     }

  //     if (error.name === 'CastError') {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid product ID'
  //       });
  //     }

  //     res.status(500).json({
  //       success: false,
  //       message: 'Error updating product'
  //     });
  //   }
  // };
// Updated updateProduct function with proper image handling
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Parse arrays if they are strings
    const parseArray = (data) => {
      if (!data) return undefined;
      if (Array.isArray(data)) return data;
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch {
          return [data];
        }
      }
      return undefined;
    };

    if (updateData.variants) {
      updateData.variants = parseArray(updateData.variants);
    }
    if (updateData.features) {
      updateData.features = parseArray(updateData.features);
    }
    if (updateData.tags) {
      updateData.tags = parseArray(updateData.tags);
    }

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let images = [...existingProduct.images];

    // Parse imageUrls ONLY if provided (for NEW URLs)
    let newImageUrls = parseArray(updateData.imageUrls);
    if (newImageUrls && newImageUrls.length > 0) {
      const urlImages = processImageUrls(newImageUrls);
      images.push(...urlImages);
      // Don't delete imageUrls from updateData yet
    }

    // Handle REMOVE images - expect image indexes or public_ids to remove
    const imagesToRemove = parseArray(updateData.imagesToRemove); // e.g. [0, 2] or ['public_id1']
    if (imagesToRemove && imagesToRemove.length > 0) {
      // Delete from Cloudinary first
      const removePromises = imagesToRemove.map(removeId => {
        const imgIndex = parseInt(removeId);
        if (!isNaN(imgIndex) && images[imgIndex]) {
          const img = images[imgIndex];
          if (img.public_id && img.public_id.startsWith('traditional-clothing/')) {
            return cloudinary.uploader.destroy(img.public_id);
          }
        } else if (typeof removeId === 'string') {
          // public_id provided
          return cloudinary.uploader.destroy(removeId);
        }
        return Promise.resolve();
      });

      await Promise.all(removePromises);

      // Filter out removed images
      images = images.filter((img, index) => {
        if (!isNaN(parseInt(imagesToRemove.find(id => parseInt(id) === index)))) {
          return false;
        }
        return !imagesToRemove.includes(img.public_id);
      });
    }

    // Add NEW uploaded images
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
        isPrimary: images.length === 0 // First image is primary if no images exist
      }));
      images.push(...uploadedImages);
    }

    // Set primary image if none exists
    if (images.length > 0 && !images.some(img => img.isPrimary)) {
      images[0].isPrimary = true;
    }

    // Update images in updateData
    updateData.images = images;

    // Clean up updateData - remove special fields
    delete updateData.imageUrls;
    delete updateData.imagesToRemove;

    // Convert numeric fields
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

  // Delete product
  exports.deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Delete images from Cloudinary
      for (const image of product.images) {
        if (image.public_id && image.public_id.startsWith('traditional-clothing/')) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }

      await Product.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  };

  // Get featured products
  exports.getFeaturedProducts = async (req, res) => {
    try {
      const products = await Product.find({ 
        status: 'Active',
        discount: { $gt: 0 } // Products with discount
      })
      .sort({ discount: -1, createdAt: -1 })
      .limit(10)
      .select('-__v');

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured products'
      });
    }
  };

  // Search products
  exports.searchProducts = async (req, res) => {
    try {
      const { q, category, collection, minPrice, maxPrice } = req.query;

      const filter = { status: 'Active' };
      
      // Text search
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ];
      }
      
      if (category) filter.category = category;
      if (collection) filter.collection = collection;
      
      // Price range
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .select('-__v');

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching products'
      });
    }
  };

