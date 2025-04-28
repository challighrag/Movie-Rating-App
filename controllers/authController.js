const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { username, email, password, isAdmin, adminPassword } = req.body;
  try {
    const userExists = await User.findOne({
      $or: [{email}, {username}]
    });
    if (userExists){
      if (userExists.username == username) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      else {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }
    if (isAdmin) {
      const ADMIN_SECRET = process.env.HASHED_ADMIN_PASSWORD;
      const isAdminPasswordValid = await bcrypt.compare(adminPassword, ADMIN_SECRET);
      
      if (!isAdminPasswordValid) {
        return res.status(403).json({ message: 'Invalid admin password' });
      }
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      isAdmin: isAdmin || false,
    });
    await user.save();
    res.status(201).json({
      _id: user._id,
      username: user.username, 
      token: generateToken(user._id), 
      isAdmin: user.isAdmin 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
    console.error(`Error creating user: ${err}`);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({ 
        _id: user._id, 
        username: user.username, 
        token: generateToken(user._id, user.isAdmin), 
        isAdmin: user.isAdmin 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
    console.error(`Login error: ${err}`);
  }
};