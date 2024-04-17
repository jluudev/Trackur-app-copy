import RootLayout from './RootLayout';
import AuthProvider from './AuthProvider';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html style={{ display: 'flex', flexDirection: 'column', height: '100%' }} lang="en">
      <body style={{ flex: 1, flexDirection: 'column', display: 'flex' }}>
        <AuthProvider>
          <RootLayout children={children} />        
        </AuthProvider>
      </body>
    </html>
  );
}