const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/auth');
const { generateToken } = require('../utils/jwt');  // Import JWT
const router = express.Router();

// create user: 
router.post('/', async (req, res) => {
    try {
        const user = await users.create(req.body);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

//gets all users
router.get('/', async (req, res) => {
    try {
        const theusers = await users.find();

        res.json({
            success: true,
            count: theusers.length,
            data: theusers
        });
    } catch (error) {
        res.json({
            success: false,
            error: 'could not load the users'
        });
    }
});

//get one user
router.get('/:id', async (req, res) => {
    try {
        const user = await users.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'object not found'
            })
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


//update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'user not found'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: 'could not update the users'
        });
    }
});


//delete user 
router.delete('/:id', async (req, res) => {
    try {
        const user = await users.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'object is not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'server error'
        });
    }
});


// POST /users - Register new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // User response without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token,  // Send token to client
      tokenExpiresIn: process.env.JWT_EXPIRE
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});


// POST /users/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user WITH password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Remove password from user object
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword,
      token,  // Send token to client
      tokenExpiresIn: process.env.JWT_EXPIRE
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});



// GET /users/me - Get logged in user's profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// GET /users/verify-token - Verify token and get user info
router.get('/verify-token', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});


module.exports = router;



