import React from 'react';
import { useThemeWithSound } from '@/hooks/useThemeWithSound';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { isDark, toggleTheme, audioEnabled, toggleAudio } = useThemeWithSound();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${isDark ? 'bg-purple-600' : 'bg-gray-300'}
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${isDark ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          <span className="flex h-full w-full items-center justify-center text-xs">
            {isDark ? '🌙' : '☀️'}
          </span>
        </span>
      </button>

      {/* Audio Toggle Button */}
      <button
        onClick={toggleAudio}
        className={`
          p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500
          ${audioEnabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}
        `}
        aria-label={`${audioEnabled ? 'Disable' : 'Enable'} theme switch sounds`}
        title={`${audioEnabled ? 'Disable' : 'Enable'} theme switch sounds`}
      >
        {audioEnabled ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.793a1 1 0 011.617.793zM16.707 9.293a1 1 0 010 1.414C15.83 11.583 15 12.694 15 14c0 1.306.83 2.417 1.707 3.293a1 1 0 11-1.414 1.414C14.29 17.71 13 15.96 13 14c0-1.96 1.29-3.71 2.293-4.707a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Alternative minimal version
export const MinimalThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useThemeWithSound();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};
