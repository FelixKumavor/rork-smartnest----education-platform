const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkApproval = require('../middleware/checkApproval');
const adminAuth = require('../middleware/adminAuth');
const { sendVerificationEmail } = require('../utils/mailer');


// Onboarding route
router.post('/onboarding', async (req, res) => {
  try {
    const { fullName, email, dob, pin } = req.body;

    if (!email || !fullName || !pin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: Email, Full Name, and PIN are mandatory."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create user
    const user = new User({
      fullName,
      email,
      dob: new Date(dob),
      pin: hashedPin
    });

    const verificationToken = crypto.randomBytes(24).toString('hex');
    user.verificationToken = verificationToken;
    user.isApproved = false;
    user.isVerified = false;
    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.log('Email failed:', emailError);
      // Still allow registration even if email sending fails
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully. Check your email to verify.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isApproved: user.isApproved,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: "Account creation failed"
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Email and PIN are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete,
          isApproved: user.isApproved,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get user profile
router.get('/profile', auth, checkApproval, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-pin');

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, checkApproval, async (req, res) => {
  try {
    const { fullName, phone, dob } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (dob) user.dob = new Date(dob);

    user.profileComplete = true;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileComplete: user.profileComplete
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Verify email from the link sent to the user
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

router.patch('/approve/:id', auth, adminAuth, async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isApproved = approved === true || approved === 'true';
    await user.save();

    res.json({
      success: true,
      message: `User approval status updated to ${user.isApproved}`,
      data: {
        id: user._id,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update approval status'
    });
  }
});

module.exports = router;