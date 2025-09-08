# Theme Switcher Sounds

## Legal Sources for Apple-like Sounds

Since Apple's original sounds are copyrighted, here are legal alternatives:

### 1. Free Sound Resources
- **Freesound.org**: Search for "UI", "beep", "notification"
- **Pixabay**: Free UI sounds section
- **Zapsplat**: Registration required but free
- **BBC Sound Effects**: Free for personal use

### 2. Recommended Search Terms
- "UI beep"
- "iOS notification" 
- "System sound"
- "Toggle switch"
- "Interface click"
- "Subtle beep"

### 3. Sound Characteristics to Look For
- **Duration**: 0.1-0.3 seconds
- **Frequency**: 800-1200 Hz range
- **Type**: Clean sine wave or soft bell
- **Volume**: Subtle, not intrusive

### 4. Current Sound File
The app now uses the actual sound file: `noisy-switch-166327.mp3`
- **File Location**: `/public/sounds/noisy-switch-166327.mp3`
- **Usage**: Both light and dark theme switches use the same sound
- **Volume**: Automatically set to 30% for subtle feedback

### 5. File Placement
Place sound files in:
```
public/sounds/
├── theme-light.mp3
├── theme-dark.mp3
├── theme-light.wav
└── theme-dark.wav
```

### 6. Suggested Filenames
- `theme-to-light.wav`
- `theme-to-dark.wav`
- `ui-beep-high.mp3`
- `ui-beep-low.mp3`

## Usage Example

```typescript
import { useThemeWithSound } from '@/hooks/useThemeWithSound';

function ThemeToggle() {
  const { isDark, toggleTheme, audioEnabled, toggleAudio } = useThemeWithSound();
  
  return (
    <div>
      <button onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </button>
      <button onClick={toggleAudio}>
        {audioEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}
```

## Audio Format Recommendations
- **MP3**: Better compression, smaller files
- **WAV**: Better quality, no compression artifacts
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Depth**: 16-bit minimum
- **File Size**: Keep under 50KB for quick loading
