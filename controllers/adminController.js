const Movie = require('../models/Movie');
const Review = require('../models/Review');

exports.addMovie = async (req, res) => {
  const { title } = req.body;
  try {
    const movieExists = await Movie.findOne({title})
    if (movieExists){
      return res.status(409).json({ message: 'Movie already exists' });
    }
    
    const movie = new Movie({ title });
    await movie.save();
    res.status(201).json({
        _id: movie._id,
        title: movie.title
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.deleteReview = async (req, res) => {
  try {
      // const reviewExists = await Review.findOne({title})
      await Review.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}