const { contextBridge } = require('electron');

// Minimal preload script since the React app doesn't use Electron APIs
// This file is required by Electron but can be mostly empty for web-based apps

// Expose basic environment info if needed
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info for any future needs
  platform: process.platform,
  arch: process.arch
});
