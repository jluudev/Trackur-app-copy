'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useRouter } from 'next/navigation';


const Footer = () => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const actions = [
    {
      label: "Map",
      icon: <MapIcon />,
      href: '/'
    },
    {
      label: "Feed",
      icon: <SearchIcon />,
      href: '/feed'
    },
    {
      label: "New Post",
      icon: <AddIcon />,
      href: '/post'
    },
    {
      label: "Profile",
      icon: <AccountBoxIcon />,
      href: '/profile'
    }
  ];

  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
  }, [value]);

  return (
    <Box sx={{ pb: 7 }} ref={ref}>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => {
            setValue(newValue);
          }}
        >
          {actions.map(action => {
            return (
              <BottomNavigationAction label={action.label} icon={action.icon} onClick={() => router.push(action.href)} />
            )
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default Footer;