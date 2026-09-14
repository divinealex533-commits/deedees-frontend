import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import './App.css';

/*
 * =========================================================
 * DEEDEE'S MARKETPLACE — THEME INITIALIZER
 * =========================================================
 *
 * Loads the customer's saved:
 *
 * 1. Blue / Emerald theme
 * 2. Light / Dark mode
 *
 * BEFORE React renders the application.
 */

const savedMarketTheme =
  localStorage.getItem(
    'deedee-market-theme'
  );

const savedDarkTheme =
  localStorage.getItem(
    'deedee-theme'
  );

const marketTheme =
  savedMarketTheme === 'emerald'
    ? 'emerald'
    : 'blue';

const isDark =
  savedDarkTheme === 'dark';

document.documentElement.setAttribute(
  'data-market-theme',
  marketTheme
);

document.documentElement.classList.toggle(
  'dark',
  isDark
);


/*
 * =========================================================
 * APPLICATION
 * =========================================================
 */

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
