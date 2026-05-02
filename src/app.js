
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
 'https://wild-be.vercel.app',
  'https://sohwaisdash.vercel.app',
  'https://springgreen-grouse-139779.hostingersite.com',
  'https://sohwais.com',
];
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:5173',
//  'https://wild-be.vercel.app',
//   'https://sohwaisdash.vercel.app',
//   'https://springgreen-grouse-139779.hostingersite.com',
//   'https://sohwais.com',
// ];
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
