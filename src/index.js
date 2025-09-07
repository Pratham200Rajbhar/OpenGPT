import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check if root element exists
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    // Fallback render method for older React versions
    try {
      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        rootElement
      );
    } catch (fallbackError) {
      
      // Last resort: render a simple error message
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          background: #111827; 
          color: white; 
          font-family: Arial, sans-serif;
          flex-direction: column;
          text-align: center;
          padding: 20px;
        ">
          <h1>Failed to Load Application</h1>
          <p>There was an error starting the React application.</p>
          <p>Error: ${error.message}</p>
          <button onclick="window.location.reload()" style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px;
          ">Reload</button>
        </div>
      `;
    }
  }
}
