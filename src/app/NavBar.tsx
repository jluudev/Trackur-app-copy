'use client'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NavBar = () => {
  const [value, setValue] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const actions = [
    {
      label: "Map",
      icon: <MapIcon />,
      href: '/map'
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

  useEffect(() => {
    const path_idx = actions.findLastIndex(action => pathname.includes(action.href));
    setValue(path_idx);
  }, [pathname]);

  return (
    <Box zIndex='1'>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => setValue(newValue)}
        >
          {actions.map(action => {
            return (
              <BottomNavigationAction 
                key={action.href} 
                label={action.label} 
                icon={action.icon} 
                onClick={() => router.push(action.href)} 
              />
            )
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default NavBar;