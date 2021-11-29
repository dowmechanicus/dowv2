import Image from 'next/image';

const Hero = ({ hero, size = 32 }: { hero: number; size?: number }) => {
	const heroURL: string = getHeroPortrait(hero);

	return (
		<Image
			layout={'fixed'}
			width={size}
			height={size}
			src={heroURL}
			alt="Hero Icon"
			className="rounded-3xl"
		/>
	);
};

export default Hero;

function getHeroPortrait(hero: number) {
	switch (hero) {
		case 1:
			return '/assets/img/dow2/portraits/sm_force_commander.png';
		case 2:
			return '/assets/img/dow2/portraits/sm_apothecary.png';
		case 3:
			return '/assets/img/dow2/portraits/sm_techmarine.png';
		case 4:
			return '/assets/img/dow2/portraits/ork_warboss.png';
		case 5:
			return '/assets/img/dow2/portraits/ork_kommando_hero.png';
		case 6:
			return '/assets/img/dow2/portraits/ork_mek_boy.png';
		case 7:
			return '/assets/img/dow2/portraits/eld_warlock_hero.png';
		case 8:
			return '/assets/img/dow2/portraits/eld_warp_spider_hero.png';
		case 9:
			return '/assets/img/dow2/portraits/eld_farseer.png';
		case 10:
			return '/assets/img/dow2/portraits/tyr_hive_tyrant.png';
		case 11:
			return '/assets/img/dow2/portraits/tyr_ravener_hero.png';
		case 12:
			return '/assets/img/dow2/portraits/tyr_lictor_hero.png';
		case 13:
			return '/assets/img/dow2/portraits/csm_chaos_lord.png';
		case 14:
			return '/assets/img/dow2/portraits/csm_plague_marine_champion.png';
		case 15:
			return '/assets/img/dow2/portraits/csm_sorcerer.png';
		case 16:
			return '/assets/img/dow2/portraits/ig_inquisitor.png';
		case 17:
			return '/assets/img/dow2/portraits/ig_commissar_lord.png';
		case 18:
			return '/assets/img/dow2/portraits/ig_commander.png';
		case 19:
			return '/assets/img/dow2/portraits/gk_brother_captain.png';
		case 20:
			return '/assets/img/dow2/portraits/gk_eversor_hero.png';
		case 21:
			return '/assets/img/dow2/portraits/gk_daemonhunter_hero.png';
		default:
			return '/assets/img/dow2/portraits/gk_daemonhunter_hero.png';
	}
}
