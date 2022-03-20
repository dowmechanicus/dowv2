import { Link, Outlet } from 'react-router-dom';

function Codex() {
  return <div>
    <h1>Codex</h1>
    <h3>Dawn of War II: Elite statistics database</h3>

    <ul>
      <li><Link to='space_marines'>Space Marines</Link></li>
      <li>Orks</li>
      <li>Eldar</li>
      <li>Tyranids</li>
      <li>Chaos Space Marines</li>
      <li>Imperial Guard</li>
      <li>Ordo Malleus</li>
    </ul>

    <Outlet />
  </div>
}


function Race() {
  return <div>Race</div>
}
export default Codex;
