const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/feed', postController.getFeed);
router.post('/', protect, postController.createPost);
router.post('/:id/like', protect, postController.likePost);
router.post('/:id/comment', protect, postController.addComment);

module.exports = router;
