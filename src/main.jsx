import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedMockEntries, clearMockEntries } from './utils/mockData.js'

if (import.meta.env.DEV) {
  // Auto-seed if localStorage is empty
  seedMockEntries();
  // Also expose helpers for manual control
  window.__seed = seedMockEntries;
  window.__clear = clearMockEntries;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
