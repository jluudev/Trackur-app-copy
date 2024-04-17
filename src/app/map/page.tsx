import React from 'react';
import { Box, Typography } from '@mui/material';
import PhotoMap from './PhotoMap';

export default function Map() {
  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h4" >Animal Map</Typography>
      </Box>
      <PhotoMap />
    </>
  )
}
