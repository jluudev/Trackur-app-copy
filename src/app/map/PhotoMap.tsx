'use client';

import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, InfoWindowF, MarkerF } from '@react-google-maps/api';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, IconButton } from '@mui/material';
import { Post } from '../types';
import DirectionsIcon from '@mui/icons-material/Directions';
import { useRouter } from 'next/navigation';
import { formatTimestamp } from '../utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


const containerStyle: CSSProperties = {
  margin: "auto",
  width: "100%",
  height: "100%",
  border: '3px solid black'
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const defaultCenter = {
  lat: 35,
  lng: -120,
};

interface Location extends Post {
  color: string;
  selected: boolean;
};

interface Animal {
  name: string;
}

const PhotoMap = () => {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey || '' });
  const [locations, setLocations] = useState<Array<Location>>([]);
  const [deviceLocation, setDeviceLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalFilter, setAnimalFilter] = useState('');
  const [timeElapsedFilter, setTimeElapsedFilter] = useState(0);
  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setDeviceLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => console.error("Error obtaining the device's location:", error)
    );
  }, []);

  useEffect(() => {
    const fetchAnimals = async () => {
      const response = await fetch('/api/animals/');
      const data = await response.json();
      setAnimals(data);
    };

    fetchAnimals();
  }, []);

  useEffect(() => {
    const fetchFilteredPosts = async () => {
      const response = await fetch('/api/post');
      let posts = await response.json() as Post[];
      if (animalFilter) {
        posts = posts.filter(post => post.animalName === animalFilter);
      }
      if (timeElapsedFilter) {
        const now = new Date();
        now.setHours(now.getHours() - 24 * timeElapsedFilter);
        posts = posts.filter(post => new Date(post.timestamp) > now);
      }
  
      const newLocations = posts.map(post => ({
        ...post,
        color: 'red',
        selected: false,
      }));
      
      setLocations(newLocations);
    };
  
    fetchFilteredPosts();
  }, [animalFilter, timeElapsedFilter]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    mapRef.current?.panTo({ lat: location.latitude, lng: location.longitude });
  };

  const AnimalFilter = () => {
    return (
      <>
        <Typography variant="h6">Filter by Animal</Typography>
        <Autocomplete
          value={animals.find(animal => animal.name === animalFilter) || null}
          onChange={(event, newValue) => {
            setAnimalFilter(newValue ? newValue.name : '');
          }}
          options={animals}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          renderInput={(params) => <TextField {...params} label="Animal" />}
          fullWidth
        />
      </>
    );
  };
  

  const TimeElapsedFilter = () => {
    const days = [1, 7, 30];

    return (
      <>
        <Typography variant="h6">Filter by time elapsed</Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>Time elapsed</InputLabel>
          <Select
            value={timeElapsedFilter}
            label="Time elapsed"
            onChange={e => setTimeElapsedFilter(Number(e.target.value))}
          >
            <MenuItem value={0}>All</MenuItem>
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {`${day} day(s) ago`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </>
    );
  }

  return (
    <Box display="flex" flex='1'>
      <Box maxWidth="200px" paddingRight="20px">
        <AnimalFilter />
        <TimeElapsedFilter />
      </Box>
      <Box flex='1'>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={8}
            onLoad={(map) => { mapRef.current = map; }}
          >
            {locations.map((location) => (
              <MarkerF
                key={location.id}
                position={{ lat: location.latitude, lng: location.longitude }}
                icon={`http://maps.google.com/mapfiles/ms/icons/${location.color}-dot.png`}
                onClick={() => onMarkerClick(location)}
              />
            ))}               
            {deviceLocation && (
              <MarkerF
                position={deviceLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10, 
                  fillColor: '#1E90FF',
                  fillOpacity: 1.0,
                  strokeWeight: 2, 
                  strokeColor: '#FFFFFF', 
                }}
              />
            )}
            {selectedLocation && (
              <InfoWindowF
                position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Typography variant='h5'>{selectedLocation.caption}</Typography>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label>Posted by {selectedLocation.user.username}</label>
                    <img 
                      src={selectedLocation.picture} 
                      alt={selectedLocation.caption} 
                      style={{ width: '150px', height: '150px', border: '1px solid black' }} 
                    />
                    <label>{formatTimestamp(selectedLocation.timestamp)}</label>
                  </Box>
                  <Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                      <Button variant="contained" onClick={() => {
                        router.push(`/feed/${selectedLocation.id}`)
                      }}>
                        View Post
                      </Button>

                      <IconButton 
                        sx={{ '&:hover': { backgroundColor: '#1565c0' }, borderRadius: '5px', backgroundColor: '#1976d2' }} 
                        onClick={() => {
                          const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`;
                          window.open(directionUrl, '_blank');
                        }} >
                        <DirectionsIcon sx={{ color: '#ffffff' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </Box>
    </Box>
  );
};

export default PhotoMap;
