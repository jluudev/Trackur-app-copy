'use client';
import React, { useState, useEffect } from 'react';
import { Grid, Container, Card, CardMedia, CardActionArea, Box, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import BackButton from '../BackButton';

const Page = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('../api/post');
        const data = await response.json();
        const sortedData = data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const formattedData = sortedData.map((post: { id: any; animalName: any; picture: any; }) => ({
          id: post.id,
          title: post.animalName,
          url: post.picture,
        }));
        setPhotos(formattedData);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
  
    fetchPosts();
  }, []);

  if (photos.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  const Posts = () => {
    return (
      <Grid container spacing={2}>
        {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={(photo as { id: string }).id}>
            <Link href={`/feed/${(photo as { id: string }).id}`} passHref>
              <Card
                sx={{
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="400"
                    image={(photo as { url: string }).url}
                    alt={(photo as { title: string }).title}
                  />
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      <BackButton />
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" paddingBottom={2}>
          <Typography variant="h4">Feed</Typography>
        </Box>
        <Posts />
      </Container>
    </>
  );
};

export default Page;
