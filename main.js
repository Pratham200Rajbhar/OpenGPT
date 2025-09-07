const { app, BrowserWindow, Menu, globalShortcut, powerMonitor, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
require('dotenv').config();

// Performance and memory optimization
app.commandLine.appendSwitch('--enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=4096');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let isQuitting = false;

// Window state management
const windowState = {
  width: 1200,
  height: 800,
  x: undefined,
  y: undefined,
  isMaximized: false
};

// Save window state
function saveWindowState() {
  if (mainWindow) {
    const bounds = mainWindow.getBounds();
    windowState.width = bounds.width;
    windowState.height = bounds.height;
    windowState.x = bounds.x;
    windowState.y = bounds.y;
    windowState.isMaximized = mainWindow.isMaximized();
  }
}

// Memory management
function performGarbageCollection() {
  if (global.gc) {
    global.gc();
  }
  
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`
      if (window.gc) {
        window.gc();
      }
      // Clear caches periodically
      if (typeof cleanupCaches === 'function') {
        cleanupCaches();
      }
    `).catch(() => {
      // Ignore errors if cleanup functions don't exist
    });
  }
}

// Enhanced window creation with optimizations
function createWindow() {
  console.log('Creating optimized main window...');
  
  // Create the browser window with enhanced security and performance
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      backgroundThrottling: true,
      spellcheck: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
    backgroundColor: '#1f2937', // Match app background
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#1f2937',
      symbolColor: '#ffffff'
    } : undefined
  });

  // Restore window state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Enhanced window event handlers
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    mainWindow.focus();
  });

  // Load the app with error handling
  const indexPath = path.join(__dirname, 'dist/index.html');
  console.log('Loading app from:', indexPath);
  
  mainWindow.loadFile(indexPath).then(() => {
    console.log('App loaded successfully');
    
    // Set up auto-updater in production
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }).catch((error) => {
    console.error('Failed to load app:', error);
    dialog.showErrorBox('Loading Error', `Failed to load application: ${error.message}`);
  });

  // Window state management
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Main window closed');
    mainWindow = null;
  });

  // Enhanced error handling
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('Main window crashed, killed:', killed);
    dialog.showErrorBox('Application Crashed', 'The application has crashed. Please restart.');
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Main window became unresponsive');
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Application Unresponsive',
      message: 'The application is not responding. Would you like to wait or restart?',
      buttons: ['Wait', 'Restart'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 1) {
        mainWindow.reload();
      }
    });
  });

  mainWindow.webContents.on('responsive', () => {
    console.log('Main window became responsive again');
  });

  // Security: Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle close event
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      saveWindowState();
    }
  });

  // Set up menu
  createMenu();
  
  // Register global shortcuts
  registerGlobalShortcuts();
  
  // Set up periodic memory cleanup
  setInterval(performGarbageCollection, 300000); // Every 5 minutes
}// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-chat');
          }
        },
        {
          label: 'Search Messages',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow?.webContents.send('menu-search');
          }
        },
        {
          label: 'Export Chats',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('menu-export');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            mainWindow?.webContents.send('menu-shortcuts');
          }
        },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Jarvis GPT',
              message: 'Jarvis GPT',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`
            });
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Register global shortcuts
function registerGlobalShortcuts() {
  // Global shortcut to show/hide the application
  globalShortcut.register('CmdOrCtrl+Shift+J', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Power management
powerMonitor.on('suspend', () => {
  console.log('System is going to sleep');
  // Pause any background tasks
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('system-suspend');
  }
});

powerMonitor.on('resume', () => {
  console.log('System resumed from sleep');
  // Resume background tasks
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('system-resume');
  }
});

// App event handlers with optimizations
// App event handlers with optimizations
app.whenReady().then(() => {
  createWindow();

  // macOS specific behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });

  // Set up auto-updater events
  if (!isDev) {
    setupAutoUpdater();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS quit handler
app.on('before-quit', () => {
  isQuitting = true;
  saveWindowState();
});

// Auto-updater setup
function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. It will be downloaded in the background.',
      buttons: ['OK']
    });
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
  });
  
  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    console.log(message);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// Handle app protocol for deep linking (optional)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('jarvis-gpt', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('jarvis-gpt');
}

// Handle deep link on Windows/Linux
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
