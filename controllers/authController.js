const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
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

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ _id: user._id, username: user.username, token: generateToken(user._id) });
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
      res.json({ _id: user._id, username: user.username, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
    console.error(`Login error: ${err}`);
  }
};