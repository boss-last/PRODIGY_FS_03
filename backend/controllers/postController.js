const { Post, User, Comment, Like } = require('../models/mongoose');

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name username profilePicture')
      .populate({
        path: 'userId',
        select: 'name username profilePicture'
      })
      .sort({ createdAt: -1 });

    // Enrich with comments
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ postId: post._id })
        .populate('userId', 'username')
        .sort({ createdAt: -1 });
      const likes = await Like.find({ postId: post._id });
      return {
        ...post.toObject(),
        comments,
        likesCount: likes.length
      };
    }));

    res.json({ success: true, data: enrichedPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, tags } = req.body;
    const post = await Post.create({
      content,
      mediaUrl,
      mediaType,
      tags,
      userId: req.user.id
    });

    const fullPost = await Post.findById(post._id)
      .populate('userId', 'name username profilePicture');

    res.status(201).json({ success: true, data: fullPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      await Like.deleteOne({ postId, userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      return res.json({ success: true, message: 'Unliked' });
    }

    await Like.create({ postId, userId });
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    res.json({ success: true, message: 'Liked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      content,
      postId: req.params.id,
      userId: req.user.id
    });

    const fullComment = await Comment.findById(comment._id)
      .populate('userId', 'username');

    res.status(201).json({ success: true, data: fullComment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
