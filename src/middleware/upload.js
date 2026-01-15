const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const configureCloudinary = require('../config/cloudinary');

const cloudinary = configureCloudinary();

// Configure storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'traditional-clothing',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Multer upload configuration
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 40 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to handle multiple image uploads
const uploadProductImages = upload.array('images', 10);

// Middleware to handle single image upload (if needed)
const uploadSingleImage = upload.single('image');

module.exports = {
  uploadProductImages,
  uploadSingleImage
};