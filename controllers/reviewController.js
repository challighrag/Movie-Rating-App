const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  const { movieId, rating, comment } = req.body;
  try {
    const review = new Review({
      user: req.user._id,
      movie: movieId,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post review' });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reviews' });
  }
};