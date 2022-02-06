import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home';
import Ladder from './ladder';
import Matches from './matches';
import MatchDetails from './match-details';
import JoinUs from './join';
import Statistics from './statistics';
import PlayerDetails from './player-details';
import Navbar from './components/navbar';

function App() {
  return (
    <div className='flex flex-col'>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/ladder" element={<Ladder />}></Route>
          <Route path="/matches" element={<Matches />}></Route>
          <Route path="/matches/:match_id" element={<MatchDetails />}></Route>
          <Route path="/join" element={<JoinUs />}></Route>
          <Route path="/statistics" element={<Statistics />}></Route>
          <Route path="/players/:player_id" element={<PlayerDetails />}></Route>
        </Routes>
      </Router>

      <footer className='mx-auto' data-theme='cyberpunk'>
        Powered by Adeptus Noobus
      </footer>
    </div>
  );
}

export default App;
