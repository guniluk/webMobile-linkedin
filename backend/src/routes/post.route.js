import express from 'express';
import {
  createPost,
  getFeedPosts,
  deletePost,
  likeUnlikePost,
  createComment,
  deleteComment,
  getPostById,
} from '../controllers/post.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, getFeedPosts);
router.post('/create', protectRoute, createPost);
router.delete('/:id', protectRoute, deletePost);
router.get('/:id', protectRoute, getPostById);
router.post('/:id/comment', protectRoute, createComment);
router.post('/:id/likeUnlike', protectRoute, likeUnlikePost);
router.delete('/:postId/comment/:commentId', protectRoute, deleteComment);

export default router;
