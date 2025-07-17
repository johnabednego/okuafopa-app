// src/utils/useCachedResources.ts
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export default function useCachedResources() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        // keep splash screen visible
        await SplashScreen.preventAutoHideAsync();

        // load custom fonts
        await Font.loadAsync({
          // add your fonts here
          // 'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
        });

        // you can also preload images, make API calls, check auth, etc.
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoaded(true);
        // hide splash once everything’s ready
        await SplashScreen.hideAsync();
      }
    }
    loadResources();
  }, []);

  return isLoaded;
}
