import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import { useEffect } from 'react';

import AppRoutes from './routes';

function App() {
  useEffect(() => {
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (prefersDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', event =>
      event.matches ? document.documentElement.setAttribute('data-theme', 'dark') : document.documentElement.setAttribute('data-theme', 'light')
    )
  }, []);

  return (
    <div className='flex flex-col'>
      <Router basename='/v2'>
        <Navbar />
        <AppRoutes />
      </Router>

      <footer className='mx-auto' data-theme='cyberpunk'>
        Forged by Adeptus Noobus
      </footer>
    </div>
  );
}

export default App;
