const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Paystack webhook
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).send('Invalid webhook payload');
    }

    const hash = crypto.createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const io = req.app.get('io');

    console.log('Paystack webhook received:', event.event);

    if (event.event !== 'charge.success') {
      return res.sendStatus(200);
    }

    const data = event.data;
    const reference = data.reference;
    const status = data.status;

    if (!reference) {
      console.log('Webhook received without transaction reference');
      return res.sendStatus(200);
    }

    const transaction = await Transaction.findOne({ reference }).populate('user property');

    if (!transaction) {
      console.log(`Transaction not found for reference: ${reference}`);
      return res.sendStatus(200);
    }

    if (status === 'success') {
      transaction.status = 'success';
      transaction.paystackReference = data.id;
      transaction.metadata = data;
      await transaction.save();

      console.log(`Payment successful for transaction: ${reference}`);

      if (io && transaction.user) {
        io.to(`user_${transaction.user._id}`).emit('payment-success', {
          transactionId: transaction._id,
          reference: transaction.reference,
          amount: transaction.amount,
          property: transaction.property ? {
            id: transaction.property._id,
            title: transaction.property.title
          } : null,
          message: 'Your payment has been confirmed successfully!'
        });
      }

      try {
        const transporter = req.app.get('mailTransporter');
        if (!transporter) {
          throw new Error('Mailer transporter is not configured.');
        }

        const mailOptions = {
          from: 'Smartnest Team <no-reply@smartnest.com>',
          to: transaction.user.email,
          subject: 'Payment Confirmation - Smartnest',
          text: `Hello ${transaction.user.fullName || transaction.user.email}, your payment has been confirmed successfully.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Payment confirmation email sent to: ${transaction.user.email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

module.exports = router;
