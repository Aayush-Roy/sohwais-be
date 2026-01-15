// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const productRoutes = require('./routes/product.routes');

// const app = express();

// // Middleware
// // app.use(cors({
// //   origin: '*', // Allow all origins in development
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));
// // app.use(cors({
// //   origin: ['http://localhost:3000','http://localhost:3001' ,'http://localhost:5173'], // Add your frontend URLs
// //   // origin:["*"],
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
// //   credentials: true,
// //   optionsSuccessStatus: 200
// // }));

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:5173',
//   'https://your-frontend.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // allow server-to-server / postman
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, origin);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
// }));

// app.options('*', cors());


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Database connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB connected successfully');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

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
// // app.use('*', (req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: `Route ${req.originalUrl} not found`
// //   });
// // });
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`
//   });
// });
// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
  
//   // Handle multer file size limit error
//   if (err.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({
//       success: false,
//       message: 'File size too large. Maximum size is 5MB.'
//     });
//   }
  
//   // Handle multer file count limit error
//   if (err.code === 'LIMIT_FILE_COUNT') {
//     return res.status(400).json({
//       success: false,
//       message: 'Too many files. Maximum 5 files allowed.'
//     });
//   }
  
//   // Handle multer file type error
//   if (err.message && err.message.includes('Only image files are allowed')) {
//     return res.status(400).json({
//       success: false,
//       message: 'Only JPG, JPEG, PNG, and WebP files are allowed'
//     });
//   }
  
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// module.exports = { app, connectDB };
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
 'https://wild-be.vercel.app',
  'https://sohwaisdash.vercel.app',
  'https://springgreen-grouse-139779.hostingersite.com',
];
// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:5173',
//   'https://sohwaisdash.vercel.app/'
// ];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Mongo (serverless safe)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
}

app.use('/api/products', productRoutes);
app.use('/api/orders',orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
