const express = require('express');
const router = express.Router();
const { addMovie, deleteReview } = require("../controllers/adminController");
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/add', verifyAdmin, addMovie);
router.delete('/delete/:id', verifyAdmin, deleteReview);

module.exports = router;