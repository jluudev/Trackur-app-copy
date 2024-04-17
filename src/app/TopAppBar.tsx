import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { AppBar, Box, Button } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const TopAppBar = ({ title }: { title: string | undefined }) => {
  const { status }  = useSession();
  const router = useRouter();
  const { data: session } = useSession();

  const loginSection = status === 'authenticated' ? 
    <>
      { session && `Welcome ${session.user.username}!` }
      <Button variant="outlined" color="inherit" onClick={() => signOut()}>Sign Out</Button>
    </>
  : <>
      <Button variant="outlined" color="inherit" onClick={() => router.push('/login')}>Login</Button>
      <Button variant="outlined" color="inherit" onClick={() => router.push('/signup')}>Sign up</Button>
    </>;

  return (
    <Box display="flex" >
      <AppBar sx={{ position: 'relative' }}>
        <Box>
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'flex-end', margin: '0px 20px' }}>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {title}
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                {loginSection}
              </Stack>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
    </Box>
  );
}

export default TopAppBar;