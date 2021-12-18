import Link from 'next/link';
import { ThemeContext } from 'pages/_app';
import { useContext } from 'react';

const Navbar = () => {
	const {
		theme: [theme, setTheme],
	} = useContext(ThemeContext);
	return (
		<div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box w-full z-50">
			<div className="flex-none px-2 mx-2">
				<span className="text-lg font-bold">dowCodex</span>
			</div>
			<div className="flex-1 px-2 mx-2">
				<div className="items-stretch hidden lg:flex">
					<Link href={'/'}>
						<a className="btn btn-ghost btn-sm rounded-btn">Home</a>
					</Link>
					<Link href={'/matches'}>
						<a className="btn btn-ghost btn-sm rounded-btn">Matches</a>
					</Link>
					<Link href={'/ladder'}>
						<a className="btn btn-ghost btn-sm rounded-btn">Ladder</a>
					</Link>
				</div>
			</div>
			<div className="flex-none">
				<button className="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="inline-block w-6 h-6 stroke-current"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						></path>
					</svg>
				</button>
			</div>
			<div className="flex-none">
				<button className="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="inline-block w-6 h-6 stroke-current"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</button>
			</div>
			<div className="flex-none">
				<select
					className="select select-bordered"
					name="theme"
					onChange={(event) => setTheme(event.target.value)}
				>
					<option value="dark">Dark</option>
					<option value="light">Light</option>
					<option value="corporate">Corporate</option>
					<option value="emerald">emerald</option>
					<option value="halloween">halloween</option>
				</select>
			</div>
		</div>
	);
};

export default Navbar;
