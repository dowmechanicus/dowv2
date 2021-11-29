import { FaHome, FaSearch, FaList } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import { GiRank3 } from 'react-icons/gi';
import Link from 'next/link';

const Navigation = () => {
	return (
		<div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col bg-gray-900 text-white shadow-lg">
			<SideBarIcon icon={<FaHome size="28" />} href={'/'} />
			<SideBarIcon icon={<FaList size="28" />} href={'/matches'} />
			<SideBarIcon icon={<GiRank3 size="28" />} href={'/ladder'} />
			<SideBarIcon icon={<MdGroups size="28" />} href={'/players'} />
			<SideBarIcon icon={<FaSearch size="28" />} href={'/search'} />
		</div>
	);
};

const SideBarIcon = ({ icon, href }: any) => (
	<div className="relative flex items-center justify-center h-12 w-12 mt-2 mb-2 mx-auto bg-gray-800 text-green-500 hover:bg-green-600 hover:text-white rounder-3xl hover:rounded-xl transition-all duration-300 ease-linear cursor-pointer">
		<Link href={href} passHref>
			<a>{icon}</a>
		</Link>
	</div>
);

export default Navigation;
