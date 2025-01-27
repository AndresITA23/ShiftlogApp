import { Slot } from 'expo-router';
import { SessionProvider } from '../ctx';
import { ShiftProvider } from './context/ShiftContext';

export default function Root() {
  return (
    <SessionProvider>
      <ShiftProvider>
      <Slot />
      </ShiftProvider>
    </SessionProvider>
  );
}