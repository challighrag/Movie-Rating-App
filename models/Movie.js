const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  releaseYear: Number
});

module.exports = mongoose.model('Movie', movieSchema);