'use client'

import { FormEvent, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { signIn, useSession } from 'next-auth/react';
import { Box, Typography } from '@mui/material';
import { redirect, useRouter } from 'next/navigation';
import { User } from '@prisma/client';

interface Confirmation {
  error: boolean,
  message: string
}

interface FormValues {
  username: Confirmation,
  password: Confirmation
}

const Page = () => {
  const [formState, setFormState] = useState({} as FormValues);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSignin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let valid = e.currentTarget.reportValidity();
    const data = new FormData(e.currentTarget);
    valid = valid && data.get('username') !== null && data.get('password') !== null;
    if (valid) {
      const signInData = {
        username: data.get('username')?.toString() || '',
        password: data.get('password')?.toString() || ''
      } as User;
      const result = await signIn("normal", { ...signInData, redirect: false });
      if (result && !result.error) {
        setError(false);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
    return false;
  }

  const { status } = useSession();
  if (status === 'authenticated') {
    redirect('/');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '15vh auto' }}>
      <Box>
        <Typography 
          variant='h3'
          noWrap
        >
          TRACKUR
        </Typography>
        <Typography
          variant='h5'
        >
          Login to your account
        </Typography>
      </Box>
      
      <form 
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '50px' }} 
        onSubmit={handleSignin}
      >
        <Box>
          { error ? (
            <Alert severity="error">Username and password are invalid.</Alert>
          ) : null }
          <TextField
            autoFocus
            margin="dense"
            id="username"
            name="username"
            label="Username"
            type="username"
            fullWidth
            required
            variant="standard"
            error={formState.username?.error}
          />
          <TextField
            margin="dense"
            name="password"
            id="password"
            label="Password"
            type="password"
            fullWidth
            required
            variant='standard'
            error={formState.password?.error}
          />
        </Box>
        <Button variant="contained" type="submit">Login</Button>
      </form>
      <Box>
        First time explorer?
        <Button onClick={() => router.push('/signup')}>
          Sign up
        </Button>
      </Box>
    </Box>
  );
}

export default Page;