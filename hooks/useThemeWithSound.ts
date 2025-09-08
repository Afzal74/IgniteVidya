import { useState, useEffect, useCallback } from 'react';

interface ThemeSwitchSounds {
  toDark: string;
  toLight: string;
}

// Use the actual sound file you added
const createThemeSounds = (): ThemeSwitchSounds => {
  // Use the same sound file for both light and dark theme switches
  // You can add separate files later if needed
  const switchSoundPath = '/sounds/noisy-switch-166327.mp3';
  
  return {
    toLight: switchSoundPath,
    toDark: switchSoundPath
  };
};

export const useThemeWithSound = () => {
  const [isDark, setIsDark] = useState(false);
  const [sounds] = useState<ThemeSwitchSounds>(() => createThemeSounds());
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setIsDark(initialTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);

  const playSound = useCallback((soundUrl: string) => {
    if (!audioEnabled) return;
    
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.3; // Keep it subtle
      audio.play().catch(() => {
        // Ignore errors if audio can't be played (user hasn't interacted yet, etc.)
      });
    } catch (error) {
      // Silently handle audio errors
    }
  }, [audioEnabled]);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDark;
    
    // Play sound before theme change for better UX
    if (newTheme) {
      playSound(sounds.toDark);
    } else {
      playSound(sounds.toLight);
    }
    
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  }, [isDark, sounds, playSound]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    const newIsDark = theme === 'dark';
    
    if (newIsDark !== isDark) {
      if (newIsDark) {
        playSound(sounds.toDark);
      } else {
        playSound(sounds.toLight);
      }
      
      setIsDark(newIsDark);
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', newIsDark);
    }
  }, [isDark, sounds, playSound]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  return {
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme,
    setTheme,
    audioEnabled,
    toggleAudio
  };
};
