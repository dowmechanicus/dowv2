import Link from 'next/link';
import { ThemeContext } from 'pages/_app';
import { useContext } from 'react';

const Navbar = () => {
  const {
    theme: [theme, setTheme],
  } = useContext(ThemeContext);
  return (
    <div className='navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box w-full z-50'>
      <div className='flex-none px-2 mx-2'>
        <span className='text-lg font-bold'>dowCodex</span>
      </div>
      <div className='flex-1 px-2 mx-2'>
        <div className='items-stretch hidden lg:flex'>
          <Link href={'/'}>
            <a className='btn btn-ghost btn-sm rounded-btn'>Home</a>
          </Link>
          <div className='dropdown'>
            <div tabIndex={0} className='btn btn-ghost btn-sm rounded-btn'>
              ESL
            </div>
            <ul
              tabIndex={1}
              className='p-2 shadow menu dropdown-content bg-base-content text-base-200 rounded-box w-52'
            >
              <li className='hover-bordered'>
                <Link href={'/ladder'}>
                  <a>Ladder</a>
                </Link>
              </li>
              <li className='hover-bordered'>
                <Link href={'/matches'}>
                  <a>Matches</a>
                </Link>
              </li>
              <li className='hover-bordered'>
                <Link href={'/statistics'}>
                  <a>Statistics</a>
                </Link>
              </li>
              <li className='divider w-full'></li>
              <li className='hover-bordered'>
                <Link href={'/join'}>
                  <a>Join us</a>
                </Link>
              </li>
            </ul>
          </div>
          <Link href={'/statistics'}>
            <a className='btn btn-ghost btn-sm rounded-btn'>Statistics</a>
          </Link>
        </div>
      </div>
      <div className='flex-none'>
        <select
          className='select select-bordered'
          name='theme'
          onChange={(event) => setTheme(event.target.value)}
        >
          <option value='dark'>Dark</option>
          <option value='light'>Light</option>
        </select>
      </div>
    </div>
  );
};

export default Navbar;
