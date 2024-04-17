'use client'

import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useRef, useState } from "react";
import ImageIcon from '@mui/icons-material/Image';
import EXIF from 'exif-js';
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Animal } from "../types";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Autocomplete } from '@mui/material';


const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string) => {
  let dd = degrees + minutes / 60 + seconds / (60 * 60);
  if (direction === "S" || direction === "W") {
    dd *= -1;
  }
  return dd;
};

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) {
    redirect('/login');
  }

  const [uploadedImg, setUploadedImage] = useState<File | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const captionRef = useRef<HTMLInputElement>();

  const [connectedToPredictor, setConnectedToPredictor] = useState(false);
  const [connectingToPredictor, setConnectingToPredictor] = useState(false);
  const [error, setError] = useState('');
  const [captionLength, setCaptionLength] = useState(0);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch('../api/animals');
        const data = await response.json();
        setAnimals(data);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
      }
    };

    fetchAnimals();
  });

  useEffect(() => {
    const checkPredictorStatus = async () => {
      setConnectingToPredictor(true);

      try {
        const res = await fetch("http://localhost:5000/ping");
        if (res.ok) {
          setConnectedToPredictor(true);
        } else {
          setConnectedToPredictor(false);
          setError("Error connecting to predictor");
        }
      } catch (error) {
        setConnectedToPredictor(false);
        setError(error.message);
      }

      setConnectingToPredictor(false);
    }

    checkPredictorStatus();
  }, []);

  //Fix bug #4
  const setLatLon = (file: File) => {
    if (!file) return;
  
    EXIF.getData(file, function(this: any) {
      let lat = EXIF.getTag(this, "GPSLatitude");
      let lon = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef");
  
      if (lat && lon && latRef && lonRef) {
        setLat(convertDMSToDD(lat[0], lat[1], lat[2], latRef));
        setLon(convertDMSToDD(lon[0], lon[1], lon[2], lonRef));
      } else {
        // Alert user and reset uploaded image state if EXIF data is missing
        alert("The uploaded image does not contain necessary location data (latitude and longitude). Please select another image.");
        setUploadedImage(null);
      }
    });
  };

  const checkIfAnimalAndCreatePost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadedImg || !captionRef.current || !animal || lat === null || lon === null || !session?.user?.id) {
      console.log("Required fields are missing");
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadedImg);

    try {
      const animalCheckResponse = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (animalCheckResponse.ok) {
        const animalCheckResult = await animalCheckResponse.json();
        if (!animalCheckResult.is_animal) {
          alert("The uploaded image is not recognized as an animal. Please upload an appropriate image.");
          setUploadedImage(null);
          return;
        }
        createPost();
      } else {
        console.error("Failed to verify the image");
      }
    } catch (error) {
      console.error("Error in verifying the image with Flask server:", error);
    }
  };

  const createPost = async () => {
    const data = {
      file: uploadedImg,
      caption: captionRef.current?.value, // Add null check for captionRef.current
      latitude: lat?.toString(),
      longitude: lon?.toString(),
      userId: session.user.id.toString(),
      animalName: animal?.name
    };

    const postFormData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file') {
        postFormData.append(key, value || ''); // Handle undefined value by providing a default value of an empty string
      } else {
        postFormData.append(key, String(value || '')); // Handle undefined value by providing a default value of an empty string
      }
    });

    try {
      const response = await fetch('../api/post', {
        method: 'POST',
        body: postFormData,
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputLength = event.target.value.length;
    if (inputLength <= 50) { // Enforce a maximum length of 50 characters
      setCaptionLength(inputLength);
      if(captionRef.current) captionRef.current.value = event.target.value;
    }
  };

  return (
    connectedToPredictor ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography component="h1" variant="h4" align="center">
          Create a Post
        </Typography>
        <form 
          style={{ display: 'flex', justifyContent: 'space-evenly', gap: '15px', flexDirection: 'column', alignItems: 'center', flex: '1' }}
          onSubmit={e => checkIfAnimalAndCreatePost(e)}
        >
          <Typography variant="h6">
            {uploadedImg === null ? 
              <ImageIcon sx={{ fontSize: 40 }}/> 
            : 
              <img 
                src={URL.createObjectURL(uploadedImg)}
                style={{ width: '100%', maxWidth: '500px', borderRadius: '15px', border: '3px solid black' }}
              />
            }
          </Typography>
          
          <Button
            variant="contained"
            component="label"
          >
            {uploadedImg === null ? "Upload image" : uploadedImg.name}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  EXIF.getData(file, function(this: any) { // Add type annotation to 'this'
                    let lat = EXIF.getTag(this, "GPSLatitude");
                    let lon = EXIF.getTag(this, "GPSLongitude");
                    if (!lat || !lon) {
                      alert("The uploaded image does not contain necessary location data (latitude and longitude). Please select another image.");
                      setUploadedImage(null);
                    } else {
                      setUploadedImage(file);
                      setLatLon(file);
                    }
                  });
                }}}
            />
          </Button>

          <TextField 
            variant="standard" 
            label="Caption goes here" 
            required 
            inputRef={captionRef} 
            helperText={`${50 - captionLength} characters remaining`} // Show characters remaining
            inputProps={{ maxLength: 50 }} // Prevent typing more than 50 characters
            onChange={handleCaptionChange} // Update the state on change
          />
          {/*
          <TextField 
            variant="outlined"
            label="Description goes here" 
            multiline 
          />
          */}
          <Box display='flex' alignItems='center' gap='25px'>
            Location
            <div>
              <div>
                {lat === null ? "No lat" : `${lat}°`}
              </div>
              <div>
                {lon === null ? "No lon" : `${lon}°`}
              </div>
            </div>
          </Box>

          <FormControl fullWidth required margin="normal">
            <Autocomplete
              value={animal}
              onChange={(event, newValue) => {
                setAnimal(newValue);
              }}
              id="combo-box-animal"
              options={animals}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Animal" variant="outlined" />}
              isOptionEqualToValue={(option, value) => option.name === value.name}
            />
          </FormControl>


          <Button variant="contained" type="submit">
            Create post
          </Button>
        </form>
        <Typography fontSize='10px' alignSelf='center'>
          Uploaded content will be analyzed for appropriateness
        </Typography>
      </div>
    )
    : (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        { connectingToPredictor &&
          <Typography>
            Connecting to image predictor...
            <CircularProgress />
          </Typography>
        }
        <Box>
          <label>{error}</label>
          {
            error && 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              Refresh
              <RefreshIcon sx={{ '&:hover': { color: 'rgb(25, 118, 210)' }, cursor: 'pointer' }} onClick={() => window.location.reload()} />
            </Box>
          }
        </Box>
      </Box>
    )
  );
}

export default Page;