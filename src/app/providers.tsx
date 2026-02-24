"use client"; // כאן ה-"use client" עובר

import { SnackbarProvider } from 'notistack';

export default function ClientSideProviders({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      {children}
    </SnackbarProvider>
  );
}