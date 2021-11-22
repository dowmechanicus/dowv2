import Image from 'next/image';

const Hero = ({ hero }: { hero: number }) => {
	let heroURL: string = '';

	switch (hero) {
		case 1:
			heroURL = 'https://dawnofwar.info/assets/img/dow2/borderless_icons/sm_force_commander.png';
			break;
		case 2:
			heroURL = 'https://dawnofwar.info/assets/img/dow2/borderless_icons/sm_apothecary.png';
			break;
		case 3:
			heroURL = 'https://dawnofwar.info/assets/img/dow2/borderless_icons/techmarine.png';
			break;
		default:
			heroURL = 'https://dawnofwar.info/assets/img/dow2/borderless_icons/sm_apothecary.png';
			break;
	}
	return <Image width="32" height="32" src={heroURL} alt="Hero" className="rounded-3xl" />;
};

export default Hero;
