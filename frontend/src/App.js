import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home';
import Ladder from './ladder';
import Matches from './matches';
import MatchDetails from './match-details';
import JoinUs from './join';
import Statistics from './statistics';
import PlayerDetails from './player-details';
import PlayerMatches from './player-matches';
import Navbar from './components/navbar';
import { useEffect } from 'react';

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
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/ladder" element={<Ladder />}></Route>
          <Route path="/matches" element={<Matches />}></Route>
          <Route path="/matches/:match_id" element={<MatchDetails />}></Route>
          <Route path="/join" element={<JoinUs />}></Route>
          <Route path="/statistics" element={<Statistics />}></Route>
          <Route path="/players/:player_id" element={<PlayerDetails />}></Route>
          <Route path="/players/:player_id/log" element={<PlayerMatches />}></Route>
        </Routes>
      </Router>

      <footer className='mx-auto' data-theme='cyberpunk'>
        Forged by Adeptus Noobus
      </footer>
    </div>
  );
}

export default App;
