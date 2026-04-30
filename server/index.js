// SETUP: The foundation
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { transporter } = require('./utils/mailer');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { MONGODB_URI, FRONTEND_URL, APP_PORT } = require('./config');

const app = express();

app.set('mailTransporter', transporter);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());

// Register webhook route before the global JSON parser so raw body validation works
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(`Connected to MongoDB at ${MONGODB_URI}`))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const paymentRoutes = require('./routes/payments');

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smartnest Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// LISTEN: The power switch
const PORT = APP_PORT;
server.listen(PORT, () => console.log(`Smartnest Backend running on port ${PORT}`));
