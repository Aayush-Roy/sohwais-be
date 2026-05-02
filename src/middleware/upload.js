
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const configureCloudinary = require('../config/cloudinary');

const cloudinary = configureCloudinary();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'traditional-clothing',
    resource_type: 'image'
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 40 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

module.exports = {
  uploadProductImages: upload.array('images', 5),
  uploadSingleImage: upload.single('image')
};
