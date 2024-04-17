'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  CircularProgress,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { Post } from '../../types';
import { useSession } from 'next-auth/react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import BackButton from '../../BackButton';
import { formatTimestamp } from '../../utils';

const PostPage = () => {
  const params = useParams<{ post: string }>();
  const postId = params.post;
  const [post, setPost] = useState<Post | null>(null);
  const commentRef = useRef<HTMLInputElement>();

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postResponse = await fetch(`/api/post?id=${postId}`);
        const postData = await postResponse.json();
        setPost(postData[0]);
      } catch (error) {
        console.error("Failed to fetch post or comments:", error);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  const postComment = async () => {
    if (session === null || commentRef.current === undefined || commentRef.current.value.length === 0) return;

    try {
      const response = await fetch('/api/post/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: commentRef.current.value,
          postId: parseInt(postId),
          userId: session.user.id,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      const updated_post = await response.json();
      setPost(updated_post);
      if (commentRef.current) {
        commentRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  if (post === null) {
    return <CircularProgress />;
  }

  const optimisticallyTogglePostLike = () => {
    if (session === null) return;

    setPost(prev => {
      if (!prev) {
        return null;
      }
      if (prev.likedBy.some(userId => userId.userId === session.user.id)) {
        return { ...prev, likedBy: post.likedBy.filter(userId => userId.userId !== session.user.id ) };
      }
      return { ...prev, likedBy: [...post.likedBy, { userId: session.user.id }]};
    });
  }
  
  const togglePostLike = async () => {
    if (session === null) return;

    try {
      const response = await fetch('/api/post/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          postId: parseInt(postId)
        })
      });

      if (!response.ok) {
        optimisticallyTogglePostLike();
        throw new Error('Failed to like post');
      }

      const updated_post = await response.json();
      setPost(updated_post);
      
    } catch (e) {
      console.error("Failed to like post:", e);
    }
  }

  const PhotoBox = () => {
    return (
      <Grid item xs={12} md={8}>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <img 
            src={post.picture} 
            alt={post.caption} 
            style={{ border: '3px solid black', maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} 
            />
          <Box sx={{ display: 'flex' }}>
            <Tooltip title={session === null ? 'Sign in to like!' : ''}>
              {session !== null && post.likedBy.some(userId => userId.userId === session.user.id) 
                ? 
                  <FavoriteIcon onClick={togglePostLike} sx={{ cursor: session === null ? 'auto' : 'pointer' }} /> 
                : 
                  <FavoriteBorderOutlinedIcon onClick={togglePostLike} sx={{ cursor: session === null ? 'auto' : 'pointer' }} />
              }
            </Tooltip>
            <div>
              {post.likedBy.length}
            </div>
          </Box>
        </Box>
      </Grid>
    );
  }

  const CommentsList = () => {
    return (
      <Paper style={{
        overflowY: 'auto',
        maxHeight: '400px', // Optional: You can set a max height for the comments list to make it scrollable.
        padding: 2,
        margin: '20px 0',
        wordBreak: 'break-word', // Ensures words break and wrap within the container.
      }} variant="outlined">
        <List dense style={{ maxWidth: '600px' }}> {/* Adjust this width as necessary */}
          {post.comments.map(comment => (
            <ListItem key={comment.id} style={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
              <ListItemText
                primary={<Typography style={{ wordBreak: 'break-word' }}>{comment.comment}</Typography>}
                secondary={`${comment.username} - ${formatTimestamp(comment.timestamp)}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  const PostInfo = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '77vh' }}>
        <Typography variant="h5" gutterBottom>{post?.caption}</Typography>
        <Typography variant="subtitle1">Animal: {post?.animalName}</Typography>
        <Typography variant="subtitle1">Posted by {post?.user?.username}</Typography>
        <Typography variant="subtitle1">
          On {post?.timestamp && new Date(post.timestamp).toLocaleDateString('en-US', {
            weekday: 'long', // "Monday"
            year: 'numeric', // "2023"
            month: 'long', // "December"
            day: 'numeric', // "18"
          })} at {post?.timestamp && new Date(post.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit', // "02"
            minute: '2-digit', // "33"
            second: '2-digit', // "17"
            hour12: true, // "PM" or "AM"
          })}
        </Typography>

        <Divider sx={{ my: 2 }}>Comments</Divider>
        {
          post.comments.length > 0 ? <CommentsList /> : <div>{session === null ? 'Sign in to comment!' : 'No comments yet! Be the first!'}</div>
        }

        {status === 'authenticated' &&
          <>
            <TextField
              label="Add a comment..."
              variant="outlined"
              fullWidth
              margin="normal"
              inputRef={commentRef}
            />
            <Button variant="contained" color="primary" onClick={postComment} sx={{ my: 2 }}>
              Post
            </Button>
          </>
        }
      </Box>
    );
  }

  return (
    <>
      <BackButton />
      <Box sx={{ display: 'flex', flex: '1', padding: 2, flexDirection: 'row', justifyContent: 'space-evenly', gap: '5%' }}>
        <PhotoBox />
        <PostInfo />
      </Box>
    </>
  );
};

export default PostPage;