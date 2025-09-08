// Generate Apple-like theme switcher sounds
// This creates simple audio tones that mimic the iOS theme switch sound

const fs = require('fs');
const path = require('path');

// Create a simple beep sound using Web Audio API (for browser)
function generateThemeSwitchSound(isDarkMode = false) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Different frequencies for light/dark mode
  const frequency = isDarkMode ? 800 : 1000; // Lower pitch for dark, higher for light
  const duration = 0.2; // 200ms
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  
  // Fade in/out for smooth sound
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Alternative: Create data URLs for simple sounds
const createSoundDataURL = (frequency, duration = 0.2) => {
  const sampleRate = 44100;
  const samples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);
  
  // Generate sine wave
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
    const envelope = Math.sin(Math.PI * i / samples); // Fade in/out
    view.setInt16(44 + i * 2, sample * envelope * 32767, true);
  }
  
  return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Export for use in React components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateThemeSwitchSound,
    createSoundDataURL
  };
}
