const Hero = ({ hero, size = 32 }) => {
  const heroURL = getHeroPortrait(hero);

  return (
    <img
      width={size}
      height={size}
      src={heroURL}
      alt='Hero Icon'
      className='rounded-3xl'
    />
  );
};

export default Hero;

function getHeroPortrait(hero) {
  switch (hero) {
    case 1:
      return '/img/portraits/sm_force_commander.png';
    case 2:
      return '/img/portraits/sm_apothecary.png';
    case 3:
      return '/img/portraits/sm_techmarine.png';
    case 4:
      return '/img/portraits/ork_warboss.png';
    case 5:
      return '/img/portraits/ork_kommando_hero.png';
    case 6:
      return '/img/portraits/ork_mek_boy.png';
    case 7:
      return '/img/portraits/eld_warlock.png';
    case 8:
      return '/img/portraits/eld_warp_spider_hero.png';
    case 9:
      return '/img/portraits/eld_farseer.png';
    case 10:
      return '/img/portraits/tyr_hive_tyrant.png';
    case 11:
      return '/img/portraits/tyr_ravener_hero.png';
    case 12:
      return '/img/portraits/tyr_lictor_hero.png';
    case 13:
      return '/img/portraits/csm_chaos_lord.png';
    case 14:
      return '/img/portraits/csm_plague_marine_champion.png';
    case 15:
      return '/img/portraits/csm_sorcerer.png';
    case 16:
      return '/img/portraits/ig_inquisitor.png';
    case 17:
      return '/img/portraits/ig_commissar_lord.png';
    case 18:
      return '/img/portraits/ig_commander.png';
    case 19:
      return '/img/portraits/gk_brother_captain.png';
    case 20:
      return '/img/portraits/gk_eversor_hero.png';
    case 21:
      return '/img/portraits/gk_daemonhunter_hero.png';
    default:
      return '/img/portraits/gk_daemonhunter_hero.png';
  }
}
