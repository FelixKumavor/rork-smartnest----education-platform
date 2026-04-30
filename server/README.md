# Smartnest Backend

Backend API for the Smartnest student housing platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with PIN-based login
- Property listings with advanced filtering
- Favorites management
- Paystack payment integration with mobile money support
- Webhook handling for payment confirmations
- Email notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payments**: Paystack API
- **Email**: Nodemailer

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and update the values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartnest
   PORT=5000
   FRONTEND_URL=http://localhost:19006
   JWT_SECRET=your_jwt_secret
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
   The backend connects to MongoDB and exposes API endpoints that the Expo frontend calls.
3. **Setup Paystack:**
   Configure your Paystack account with subaccounts and splits:
   ```bash
   npm run setup-paystack
   ```
   This will create subaccounts for platform fees and agent commissions, then create a payment split.

4. **Configure Paystack Webhook:**
   In your Paystack dashboard:
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
   - Select events: `charge.success`

5. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/onboarding` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Properties
- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties/:id/favorite` - Add to favorites
- `DELETE /api/properties/:id/favorite` - Remove from favorites
- `GET /api/properties/favorites/list` - Get user's favorites

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/charge` - Charge with mobile money
- `GET /api/payments/verify/:reference` - Verify payment status
- `GET /api/payments/transactions` - Get user transactions

### Webhooks
- `POST /api/webhooks/paystack` - Paystack webhook handler

## Payment Flow

1. **Frontend initiates payment** → Creates transaction record with reference
2. **User provides mobile money details** → Calls `/api/payments/charge`
3. **Paystack processes payment** → Sends webhook on completion
4. **Backend updates transaction** → Via webhook handler
5. **Real-time notification** → Socket.IO emits payment success to user
6. **Email confirmation** → Automatic email sent to user

## Paystack Integration

### Mobile Money Payment
```javascript
POST /api/payments/charge
{
  "propertyId": "property_id",
  "amount": 100,
  "mobileNumber": "0207477013",
  "provider": "mtn"
}
```

### Real-time Notifications
The backend uses Socket.IO for real-time payment status updates:

```javascript
// Frontend connection
const socket = io('http://localhost:5000');
socket.emit('join-user-room', userId);

// Listen for payment success
socket.on('payment-success', (data) => {
  console.log('Payment confirmed:', data);
  // Update UI with success message
});
```

### Webhook Handling
The webhook endpoint receives payment confirmations from Paystack and:
- Updates transaction status in database
- Sends real-time notification via Socket.IO
- Sends email confirmation to user

## Development

- Use `npm run dev` for development with nodemon
- All routes are protected with JWT authentication (except onboarding/login)
- CORS is enabled for cross-origin requests
- Error handling middleware is implemented

## Deployment

1. Set up MongoDB database
2. Configure environment variables
3. Set up Paystack webhook URL in your Paystack dashboard
4. Deploy to your preferred hosting service (Heroku, AWS, etc.)

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Test all endpoints
4. Update documentation