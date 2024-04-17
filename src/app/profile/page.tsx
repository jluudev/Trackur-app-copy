'use client'

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProfileCard from "./ProfileCard";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { useEffect, useState } from "react";
import { Box, Card, CardActionArea, CardMedia, CircularProgress, Container, Typography } from "@mui/material";
import Link from "next/link";
import BackButton from "../BackButton";

const Page = () => {
  const { data: session } = useSession();

  const theme = createTheme();

  if (!session) {
    redirect('/login');
  }

  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`../api/profile?userId=${session.user.id}`);
        const data = await response.json();
        if (data.posts && Array.isArray(data.posts)) {
          const formattedData = data.posts.map((post: any) => ({
            id: post.id,
            title: post.animalName,
            url: post.picture,
          }));
          setPhotos(formattedData);
        } else {
          setPhotos([]); // Set photos to an empty array or handle accordingly
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
  
    if (session?.user?.id) {
      fetchPosts();
    }
  }, [session]);
  

// Adjusted to include feedback when no posts are available
if (photos.length === 0) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <Grid container direction="column" sx={{ overflowX: "hidden" }}>
            <img
              alt="avatar"
              style={{
                width: "100vw",
                height: "35vh",
                objectFit: "cover",
                objectPosition: "50% 50%",
                position: "relative"
              }}
              src="https://iris2.gettimely.com/images/default-cover-image.jpg"
            />
            <Grid container direction={{ xs: "column", md: "row" }} spacing={3} sx={{ position: "absolute", left: '40%', marginTop: '25px' }}>
              <Grid item md={3}>
                <ProfileCard name={session.user.username} />
              </Grid>
            </Grid>
          </Grid>
          <Container maxWidth="lg" sx={{ textAlign: 'center', marginTop: '20px' }}>
            <Typography variant="h5">No posts yet.</Typography>
          </Container>
        </CssBaseline>
      </ThemeProvider>
    </>
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
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <Grid container direction="column" sx={{ overflowX: "hidden" }}>
            <img
              alt="avatar"
              style={{
                width: "100vw",
                height: "35vh",
                objectFit: "cover",
                objectPosition: "50% 50%",
                position: "relative"
              }}
              src="https://iris2.gettimely.com/images/default-cover-image.jpg"
            />

            <Grid
              container
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{
                position: "absolute",
                left: '40%',
                marginTop: '25px'
              }}
            >
              <Grid item md={3}>
                <ProfileCard
                  name={session.user.username}
                />
              </Grid>
            </Grid>
          </Grid>
          <br></br>
          <Container maxWidth="lg">
            <Posts />
          </Container>
        </CssBaseline>
      </ThemeProvider>
    </div>
  )
}

export default Page;
