const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/smartnest',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:19006',
  APP_PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
};
