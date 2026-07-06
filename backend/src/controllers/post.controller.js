import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';
import cloudinary, { uploadOnCloudinary } from '../lib/cloudinary.js';
import { sendCommentNotificationEmail } from '../emails/emailHandler.js';

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: {
        $in: [...(req.user.connections || []), req.user._id],
      },
    })
      .populate('author', 'name username profilePicture headline')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log('get feed posts error:', error);
    res.status(500).json({ message: 'Failed to get posts', error });
  }
};

export const createPost = async (req, res) => {
  try {
    let { content, image } = req.body;
    const author = req.user._id;
    if (!content && !image) {
      return res
        .status(400)
        .json({ message: 'Post must have content or image' });
    }
    if (image && image.startsWith('data:image')) {
      const secureUrl = await uploadOnCloudinary(image, 'posts');
      image = secureUrl;
    } else if (req.files && req.files.image) {
      const file = req.files.image;
      const filePath = file.path || file.tempFilePath;
      if (filePath) {
        const secureUrl = await uploadOnCloudinary(filePath, 'posts');
        image = secureUrl;
      }
    }
    const post = await Post.create({ content, image, author });
    res.status(201).json(post);
  } catch (error) {
    console.log('create post error:', error);
    res.status(500).json({ message: 'Failed to create post', error });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 작성자 본인인지 확인
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this post' });
    }

    // Cloudinary에 업로드된 이미지가 있다면 스토리지에서 삭제
    if (post.image) {
      try {
        const parts = post.image.split('/');
        const fileName = parts.pop();
        const folder = parts.pop();
        const publicId = `${folder}/${fileName.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary image deletion error:', cloudinaryError);
      }
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.log('delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post', error });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate('author', 'name username profilePicture headline')
      .populate('comments.user', 'name username profilePicture headline');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.log('get post by id error:', error);
    res.status(500).json({ message: 'Failed to get post by id', error });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ content, user: req.user._id });
    await post.save();

    // 본인 글이 아닐 때만 알림 생성
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        type: 'comment',
        relatedUser: req.user._id,
        relatedPost: postId,
      });
    }

    // 생성된 유저 정보를 populate하여 가져옴
    const updatedPost = await Post.findById(postId)
      .populate('author', 'name username profilePicture headline email')
      .populate('comments.user', 'name username profilePicture headline email');

    // send email to post author (only if commenter is not the author)
    if (updatedPost.author._id.toString() !== req.user._id.toString()) {
      try {
        const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
        await sendCommentNotificationEmail(
          updatedPost.author.email,
          req.user.name,
          updatedPost.author.name,
          content,
          postUrl,
        );
      } catch (emailError) {
        console.error('Failed to send comment email:', emailError);
      }
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log('create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment', error });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // 이미 좋아요를 누른 상태 -> 좋아요 취소 (Unlike)
      post.likes.pull(req.user._id);

      // 내가 보낸 기존 좋아요 알림이 있다면 삭제
      try {
        await Notification.deleteOne({
          recipient: post.author,
          type: 'like',
          relatedUser: req.user._id,
          relatedPost: postId,
        });
      } catch (notificationError) {
        console.error('Error deleting like notification:', notificationError);
      }
    } else {
      // 좋아요를 누르지 않은 상태 -> 좋아요 추가 (Like)
      post.likes.push(req.user._id);

      // 본인 글이 아닐 때만 알림 생성
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          type: 'like',
          relatedUser: req.user._id,
          relatedPost: postId,
        });
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log('like unlike post error:', error);
    res.status(500).json({ message: 'Failed to toggle like on post', error });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // 댓글 작성자 본인 또는 게시글 작성자만 댓글 삭제 가능
    const isCommentAuthor =
      comment.user && comment.user.toString() === req.user._id.toString();
    const isPostAuthor =
      post.author && post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    // 댓글 작성 시 생성된 알림이 있다면 삭제
    try {
      await Notification.findOneAndDelete({
        recipient: post.author,
        type: 'comment',
        relatedUser: comment.user,
        relatedPost: postId,
      });
    } catch (notificationError) {
      console.error('Error deleting comment notification:', notificationError);
    }

    const updatedPost = await Post.findById(postId)
      .populate('author', 'name username profilePicture headline')
      .populate('comments.user', 'name profilePicture');

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log('delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment', error });
  }
};
