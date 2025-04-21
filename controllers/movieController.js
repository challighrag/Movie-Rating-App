const Movie = require('../models/Movie');
const Review = require('../models/Review');

exports.getMovies = async (req, res) => {
  try {
    const query = req.query.q || '';

    const movies = await Movie.aggregate([
      {
        $match: {
          title: { $regex: query, $options: 'i' }
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          releaseYear: 1,
          averageRating: { $ifNull: ['$averageRating', 0] },
          reviewCount: 1
        }
      }
    ]);

    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
};