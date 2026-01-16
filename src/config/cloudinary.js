// const cloudinary = require('cloudinary').v2;

// const configureCloudinary = () => {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
//   });

//   return cloudinary;
// };

// module.exports = configureCloudinary;
const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    signature_algorithm: 'sha256'  // Add this line
  });
  
  return cloudinary;
};

module.exports = configureCloudinary;