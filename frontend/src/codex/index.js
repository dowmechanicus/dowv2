import { Link, Outlet } from 'react-router-dom';

function Codex() {
  return <div>
    <h1>Codex</h1>
    <h3>Dawn of War II: Elite statistics database</h3>

    <ul className='justify-center tabs'>
      <li className='tab tab-lg tab-lifted'><Link to='space_marines'>Space Marines</Link></li>
      <li className='tab tab-lg tab-lifted'>Orks</li>
      <li className='tab tab-lg tab-lifted'>Eldar</li>
      <li className='tab tab-lg tab-lifted'>Tyranids</li>
      <li className='tab tab-lg tab-lifted'>Chaos Space Marines</li>
      <li className='tab tab-lg tab-lifted'>Imperial Guard</li>
      <li className='tab tab-lg tab-lifted'>Ordo Malleus</li>
    </ul>

    <Outlet />
  </div>
}


function Race() {
  return <div>Race</div>
}
export default Codex;
