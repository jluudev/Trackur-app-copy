'use client'

import { FormEvent, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { signIn } from 'next-auth/react';
import Alert from '@mui/material/Alert';
import { User } from '@prisma/client';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

interface Confirmation {
  error: boolean,
  message: string
}

interface FormState {
  username: Confirmation,
  passwordConfirmation: Confirmation
}

export default function Signup() {
  const [formState, setFormState] = useState({} as FormState);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let valid = e.currentTarget.reportValidity();
    const data = new FormData(e.currentTarget);
    valid = valid && data.get('password') !== null && data.get('passwordConfirmation') !== null;
    if (valid) {
      const signUpData = {
        username: data.get('username')?.toString() || '',
        password: data.get('password')?.toString() || ''
      } as User;
      const res = await fetch("/api/users", {
        method: 'post',
        body: JSON.stringify(signUpData)
      })
      if (res.ok) {
        const result = await signIn("normal", { ...signUpData, redirect: false });
        if (result && !result.error) {
          setError(false);
          router.push('/');
        } else {
          setError(true);
        }
      } else {
        setError(true);
        res.json().then((j) => console.log('error:' + j));
      }
    } else {
      setFormState({...formState, passwordConfirmation: { error: true, message: "Your passwords don't match." }})
    }
    return false;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '15vh auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant='h3'>Sign up TODAY!</Typography>
        <Typography variant='h6'>Your adventure starts here!</Typography>
      </Box>

      <form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }} onSubmit={handleSignup}>
        <Box>
          { error ? (
            <Alert severity="error">There was an issue signing up, please adjust username and password and try again.</Alert>
          ) : null }
          <TextField
            autoFocus
            margin="dense"
            id="username"
            name="username"
            label="Username"
            type="username"
            fullWidth
            variant="standard"
            required
            error={formState.username?.error}
          />
          <TextField
            margin="dense"
            id="password"
            name="password"
            label="Password"
            type="password"
            required
            fullWidth
            variant='standard'
          />
          <TextField
            margin="dense"
            name="passwordConfirmation"
            id="passwordConfirmation"
            label="Password Confirmation"
            type="password"
            required
            fullWidth
            error={formState.passwordConfirmation?.error}
            helperText={formState.passwordConfirmation?.message}
            variant='standard'
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <Button variant="contained" type="submit">Agree and Continue</Button>
          <div style={{ fontSize: '8px' }}>
            {`By selecting Agree and Continue, I agree to TRACKUR's `}
            <a href={'/terms'}>Terms and Services</a>
          </div>
        </Box>
        
      </form>
    </Box>
  );
}