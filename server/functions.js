function getHeroId(race, hero) {
  // Grey Knights are special (ofc they are)
  if (race === 0 && hero > 2) {
    // To differentiate Grey Knights from Space Marines properly
    // we must manually override the race id
    race = 6;
  }

  switch(race) {
    case 0:
      switch (hero) {
        case 0: return 1;
        case 1: return 2;
        case 2: return 3;
        // If for whatever reason race was not overridden
        case 3: return 19;
        case 4: return 20;
        case 5: return 21;
      }
    case 1:
      switch (hero) {
        case 0: return 4;
        case 1: return 5;
        case 2: return 6;
      }
    case 2:
      switch (hero) {
        case 0: return 7;
        case 1: return 8;
        case 2: return 9;
      }
    case 3:
      switch (hero) {
        case 0: return 10;
        case 1: return 11;
        case 2: return 12;
      }
    case 4:
      switch (hero) {
        case 0: return 13;
        case 1: return 14;
        case 2: return 15;
      }
    case 5:
      switch (hero) {
        case 0: return 16;
        case 1: return 17;
        case 2: return 18;
      }
    case 6:
      switch (hero) {
        case 0: return 19;
        case 1: return 20;
        case 2: return 21;
      }
  }
}

module.exports = {
  getHeroId
}