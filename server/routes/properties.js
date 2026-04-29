const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

function adminAuth(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

// Get all public properties with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query,
      minPrice,
      maxPrice,
      roomType,
      amenities,
      city,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Room type
    if (roomType) {
      filter.roomType = roomType;
    }

    // Amenities
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $in: amenitiesArray };
    }

    // City
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // Only public approved properties on the Explore feed
    filter.status = 'approved';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const properties = await Property.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: {
        properties,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Owner route: list properties uploaded by the signed-in owner
router.get('/owner/list', auth, async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.user._id });
    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin route: get all properties regardless of status
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const properties = await Property.find().populate('postedBy', 'fullName email role');
    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Owner route: create a new property listing
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, location, images, amenities, roomType } = req.body;

    const property = new Property({
      title,
      description,
      price,
      location,
      images: images || [],
      amenities: amenities || [],
      roomType,
      postedBy: req.user._id,
      status: 'pending'
    });

    await property.save();

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin route: update property status
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'blocked'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: updatedProperty
    });
  } catch (err) {
    console.error('Update property status error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Admin route: delete property
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property'
    });
  }
});

// Add to favorites
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const user = req.user;

    // Check if already in favorites
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Property already in favorites'
      });
    }

    user.favorites.push(req.params.id);
    await user.save();

    res.json({
      success: true,
      message: 'Added to favorites'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove from favorites
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const user = req.user;

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== req.params.id
    );

    await user.save();

    res.json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's favorites
router.get('/favorites/list', auth, async (req, res) => {
  try {
    const user = await req.user.populate('favorites');

    res.json({
      success: true,
      data: user.favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;