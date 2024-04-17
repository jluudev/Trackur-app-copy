'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  return (
    <ArrowBackIcon onClick={() => router.back()} sx={{ cursor: 'pointer' }} />
  );
}

export default BackButton;