import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { AppProvider } from './store.jsx';
import App from './App.jsx';
import { registerSW } from './lib/pwa.js';

registerSW();

createRoot(document.getElementById('root')).render(
  <StrictMode><AppProvider><App /></AppProvider></StrictMode>
);
