const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');
const PaystackService = require('../utils/paystack');
const crypto = require('crypto');

// Generate unique reference
function generateReference() {
  return 'TXN_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
}

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    if (!propertyId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and amount are required'
      });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const reference = generateReference();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      property: propertyId,
      amount,
      reference,
      status: 'pending'
    });

    await transaction.save();

    // Initialize Paystack transaction
    const paystackResponse = await PaystackService.initializeTransaction(
      req.user.email,
      amount,
      reference,
      {
        userId: req.user._id,
        propertyId,
        transactionId: transaction._id
      }
    );

    if (!paystackResponse.success) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(500).json({
        success: false,
        message: 'Payment initialization failed'
      });
    }

    res.json({
      success: true,
      data: {
        transaction: transaction,
        paystack: paystackResponse.data
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Charge with mobile money
router.post('/charge', auth, async (req, res) => {
  try {
    const { propertyId, amount, mobileNumber, provider } = req.body;

    if (!propertyId || !amount || !mobileNumber || !provider) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const reference = generateReference();
    const splitCode = 'SPL_DEz6ryB9ed'; // From requirements

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      property: propertyId,
      amount,
      reference,
      status: 'processing',
      paymentMethod: 'mobile_money',
      mobileMoney: {
        number: mobileNumber,
        provider: provider.toLowerCase()
      },
      splitCode
    });

    await transaction.save();

    // Charge with Paystack
    const chargeResponse = await PaystackService.chargeMobileMoney(
      req.user.email,
      amount,
      mobileNumber,
      provider,
      reference,
      splitCode
    );

    if (!chargeResponse.success) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(500).json({
        success: false,
        message: 'Payment charge failed',
        error: chargeResponse.error
      });
    }

    transaction.paystackReference = chargeResponse.data.reference;
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment initiated. Please check your phone for the payment prompt.',
      data: {
        transaction: transaction,
        paystack: chargeResponse.data
      }
    });

  } catch (error) {
    console.error('Payment charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify payment status
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await Transaction.findOne({
      reference,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If already verified, return current status
    if (transaction.status === 'success' || transaction.status === 'failed') {
      return res.json({
        success: true,
        data: transaction
      });
    }

    // Verify with Paystack
    const verifyResponse = await PaystackService.verifyTransaction(reference);

    if (verifyResponse.success) {
      const paystackData = verifyResponse.data;

      if (paystackData.status === 'success') {
        transaction.status = 'success';
        transaction.paystackReference = paystackData.reference;
      } else {
        transaction.status = 'failed';
      }

      await transaction.save();
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('property', 'title price location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;