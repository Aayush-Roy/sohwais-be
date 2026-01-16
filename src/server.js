// // const { app, connectDB } = require('./app');

// // const PORT = process.env.PORT || 5000;

// // // Start server
// // const startServer = async () => {
// //   try {
// //     // Connect to database
// //     await connectDB();
    
// //     // Start server
// //     app.listen(PORT, () => {
// //       console.log(`Server running on port ${PORT}`);
// //       console.log(`Health check: http://localhost:${PORT}/health`);
// //       console.log(`Products API: http://localhost:${PORT}/api/products`);
// //     });
// //   } catch (error) {
// //     console.error('Failed to start server:', error);
// //     process.exit(1);
// //   }
// // };

// // // Handle unhandled promise rejections
// // process.on('unhandledRejection', (err) => {
// //   console.error('Unhandled Rejection:', err);
// //   process.exit(1);
// // });

// // // Handle uncaught exceptions
// // process.on('uncaughtException', (err) => {
// //   console.error('Uncaught Exception:', err);
// //   process.exit(1);
// // });

// // startServer();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const productRoutes = require('./routes/product.routes');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/products', productRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'UP',
//     timestamp: new Date().toISOString(),
//     service: 'Traditional Clothing Ecommerce API'
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
  
//   // Handle multer errors
//   if (err.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({
//       success: false,
//       message: 'File size too large. Maximum size is 5MB.'
//     });
//   }
  
//   if (err.code === 'LIMIT_FILE_COUNT') {
//     return res.status(400).json({
//       success: false,
//       message: 'Too many files. Maximum 5 files allowed.'
//     });
//   }
  
//   res.status(500).json({
//     success: false,
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // Connect to MongoDB and start server
// const startServer = async () => {
//   try {
//     // Remove deprecated options for newer MongoDB driver
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB connected successfully');
    
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Health check: http://localhost:${PORT}/health`);
//       console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
//     });
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// startServer();
// src/server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const Order = require('./models/Order');
const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// CORS FIX - 100% WORKING
// ====================
app.use((req, res, next) => {
  // List of allowed origins
  const allowedOrigins = [
    'https://sohwais.com',
    'https://www.sohwais.com',
    'https://wild-be.vercel.app',
    'https://sohwaisdash.vercel.app',
    'https://springgreen-grouse-139779.hostingersite.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3001'
  ];
  const cloudinary = configureCloudinary();
console.log('Cloudinary config:', cloudinary.config());
  const origin = req.headers.origin;
  
  // If origin is in allowed list, set it dynamically
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
// Health check with CORS test
app.get('/health', (req, res) => {
  console.log('Health check from origin:', req.headers.origin);
  
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Traditional Clothing Ecommerce API',
    cors: 'Enabled',
    yourOrigin: req.headers.origin,
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173'
    ]
  });
});



// 404 handler
app.use((req, res) => {
  console.log('404 for:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 Products API: http://localhost:${PORT}/api/products`);
      console.log('✅ CORS enabled for:');
      console.log('   - http://localhost:3000');
      console.log('   - http://localhost:3001');
      console.log('   - http://localhost:5173');
      console.log('   - http://127.0.0.1:3000');
      console.log('   - http://127.0.0.1:3001');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();