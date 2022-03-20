import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box w-full z-50'>
      <div className='flex-none px-2 mx-2'>
        <span className='text-lg font-bold'>dowCodex</span>
      </div>
      <div className='flex-1 px-2 mx-2'>
        <div className='items-stretch hidden lg:flex'>
          <Link to='/'>
            <span className='btn btn-ghost btn-sm rounded-btn'>Home</span>
          </Link>
          <Link to='/codex'>
            <span className='btn btn-ghost btn-sm rounded-btn'>Codex</span>
          </Link>
          <Link to='/ladder'>
            <span className='btn btn-ghost btn-sm rounded-btn'>Ladder</span>
          </Link>
          <Link to='/matches'>
            <span className='btn btn-ghost btn-sm rounded-btn'>Matches</span>
          </Link>
          <Link to='/statistics'>
            <span className='btn btn-ghost btn-sm rounded-btn'>Statistics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
