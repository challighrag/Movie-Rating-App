const express = require('express');
const router = express.Router();
const { addReview, getMovieReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/:movieId', getMovieReviews);

module.exports = router;