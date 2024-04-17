'use client'

import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BottomNavigation, CircularProgress, Typography } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import NavBar from './NavBar';
import TopAppBar from './TopAppBar';
import RefreshIcon from '@mui/icons-material/Refresh';
  
const theme = createTheme({});

export default function RootLayout({ children, title }: { children: ReactNode, title?: string }) {
  const [connectedToDB, setConnectedToDB] = useState(false);
  const [connectingToDB, setConnectingToDB] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDBStatus = async () => {
      setConnectingToDB(true);

      const res = await fetch('/api/status');
      const status = await res.json();
      if (res.status === 200) {
        setConnectedToDB(true);
      } else {
        setConnectedToDB(false);
        setError(status.error);
      }

      setConnectingToDB(false);
    }

    fetchDBStatus()
  }, []);

  const ConnectingToDatabase = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        { connectingToDB && 
          <Typography>
            Connecting to database...
            <CircularProgress />
          </Typography>
        }
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ color: 'red' }}>{error}</label>
          {
            error && 
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              Refresh
              <RefreshIcon sx={{ '&:hover': { color: 'rgb(25, 118, 210)' }, cursor: 'pointer' }} onClick={() => window.location.reload()} />
            </Box>
          }
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      {connectedToDB 
        ? 
          <>
            <TopAppBar title={title} />
            <Box component="main" flex='1' display='flex' flexDirection='column' sx={{ p: 3 }}>
              { children }
            </Box>
            <BottomNavigation showLabels>
              <NavBar />
            </BottomNavigation>
          </>
        :
          <ConnectingToDatabase />   
      }
      
    </ThemeProvider>
  );
}