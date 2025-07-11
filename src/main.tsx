import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA Install prompt handling
let deferredPrompt: any;
let installButton: HTMLElement | null = null;

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                showUpdateNotification();
              }
            });
          }
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            showUpdateNotification();
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Show update notification
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <span>New version available!</span>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #2563eb;
        border: none;
        padding: 4px 12px;
        margin-left: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">Update</button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 4px 12px;
        margin-left: 8px;
        border-radius: 4px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  document.body.appendChild(updateBanner);
}

// Handle app install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt available');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show custom install button
  showInstallButton();
});

// Show install button
function showInstallButton() {
  // Only show if not already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return; // Already installed
  }
  
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 400px;
      margin: 0 auto;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="/icon-72.png" alt="Mind the Gap" style="width: 48px; height: 48px; border-radius: 8px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">Install Mind the Gap</div>
          <div style="font-size: 14px; color: #6b7280;">Add to your home screen for quick access</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button id="install-app-btn" style="
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          flex: 1;
        ">Install</button>
        <button id="install-dismiss-btn" style="
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">Not now</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Add event listeners
  document.getElementById('install-app-btn')?.addEventListener('click', installApp);
  document.getElementById('install-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('install-banner')?.remove();
  });
}

// Install the app
async function installApp() {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Remove the install banner
    document.getElementById('install-banner')?.remove();
  }
}

// Handle successful app installation
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed successfully');
  // Remove install banner if still visible
  document.getElementById('install-banner')?.remove();
  
  // Show success message
  const successBanner = document.createElement('div');
  successBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px;
      text-align: center;
      border-radius: 8px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      ✅ Mind the Gap installed successfully!
    </div>
  `;
  document.body.appendChild(successBanner);
  
  setTimeout(() => {
    successBanner.remove();
  }, 3000);
});

// Handle URL parameters for shortcuts
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const tab = urlParams.get('tab');
  
  if (action === 'add-task') {
    // Trigger add task modal after app loads
    setTimeout(() => {
      const addButton = document.querySelector('[data-add-task]') as HTMLElement;
      if (addButton) {
        addButton.click();
      }
    }, 1000);
  }
  
  if (tab) {
    // Switch to specific tab after app loads
    setTimeout(() => {
      const tabButton = document.querySelector(`[data-tab="${tab}"]`) as HTMLElement;
      if (tabButton) {
        tabButton.click();
      }
    }, 500);
  }
});

// Detect if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true) {
  console.log('Running as PWA');
  document.documentElement.classList.add('pwa-mode');
  
  // Hide browser UI elements when running as PWA
  const style = document.createElement('style');
  style.textContent = `
    .pwa-mode body {
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    
    .pwa-mode {
      overscroll-behavior: none;
    }
  `;
  document.head.appendChild(style);
}

// Handle offline/online status
window.addEventListener('online', () => {
  console.log('App is online');
  // Trigger sync when back online
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('background-sync');
    });
  }
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  // Show offline indicator
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offline-banner';
  offlineBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 8px;
      text-align: center;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    ">
      📱 You're offline - changes will sync when reconnected
    </div>
  `;
  document.body.appendChild(offlineBanner);
});

// Remove offline banner when back online
window.addEventListener('online', () => {
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) {
    offlineBanner.remove();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
