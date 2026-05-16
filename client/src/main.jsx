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
              border: '1px solid #2a2a2a',
              background: '#1a1a1a',
              color: '#f4f4f5',
              fontWeight: 500,
              fontFamily: 'Manrope, sans-serif',
              borderRadius: 12,
              padding: '12px 16px'
            },
            success: {
              iconTheme: { primary: '#22d3ee', secondary: '#0a0a0a' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
