import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              border: '3px solid #0a0a0a',
              background: '#ffe119',
              color: '#0a0a0a',
              fontWeight: 700,
              fontFamily: 'Archivo, sans-serif',
              borderRadius: 0,
              boxShadow: '4px 4px 0 0 #0a0a0a',
              padding: '12px 16px'
            },
            error: {
              style: {
                background: '#ff5a5f',
                border: '3px solid #0a0a0a',
                color: '#0a0a0a',
                fontWeight: 700,
                boxShadow: '4px 4px 0 0 #0a0a0a',
                borderRadius: 0
              }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
