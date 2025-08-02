import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework ready hook for Expo
    console.log('Framework ready');
  }, []);
}