import { Link, Outlet } from 'react-router-dom';

function SpaceMarines() {
  return <div>
    <h1>Space Marines</h1>
    <ul>
      <li><Link to='tactical_marines'>Tactical Marines</Link></li>
    </ul>

    <Outlet />
  </div>
}

export default SpaceMarines;
