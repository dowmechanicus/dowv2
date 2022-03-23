const exec = require('util').promisify(require('child_process').exec);
const spawn = require('util').promisify(require('child_process').spawn);

const { SBPS_PATHS } = require('./attrib_paths');
const query = require('./db');
const logger = require('./logger');

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

async function addPlayerToDB(player) {
  try {
    await query(
      'INSERT INTO players (relic_id, steam_id, last_steam_name) VALUES (?, ?, ?)',
      [player.relic_id, player.steam_id, player.name]
    );
  } catch (error) {
    throw new Error(`Could not add player ${player.relic_id} to the database`);
  }
}

async function findMap(id) {
  try {
    const res = await query('SELECT * FROM maps WHERE id = ?', [id]);

    return res[0];
  } catch (error) {
    throw new Error(`Could not find map with id ${id}`);
  }
}

async function rbf2json(path, version = 'latest') {
  if (!path) {
    throw new Error('No path given to rbf2json');
  }

  const sgacat = '/usr/local/bin/sgacat';
  const elite_attributes = `/srv/users/serverpilot/apps/dowcodex/public/elite/attributes/${version}/Elite_attrib.sga`;
  const original_attributes = `/srv/users/serverpilot/apps/dowcodex/public/elite/attributes/GameAttrib_orig.sga`;

  logger.debug(`Opening Elite attributes to look for key: ${path}`);
  let { stdout: json, stderr } = await exec(`${sgacat} ${elite_attributes} "${path}"`);

  if (stderr) {
    logger.error(stderr);
    throw new Error(stderr);
  }

  if (json.includes('usage:')) {
    logger.error('SGA file not found');
    throw new Error('sga file not found');
  }

  if (!json) {
    logger.debug(`Opening original attributes to look for key: ${path}`);
    let { _stdout, _stderr } = await exec(`${sgacat} ${original_attributes} "${path}"`);
    json = _stdout;
    stderr = _stderr;
  }

  if (stderr) {
    logger.error(stderr);
    throw new Error(stderr);
  }

  if (!json) {
    throw new Error(`Path ${path} was neither found in Elite nor original attributes`);
  }

  if (json.includes('usage:')) {
    logger.error('SGA file not found');
    throw new Error('sga file not found');
  }

  return JSON.parse(json);
}

function getSbpsPathFromName(name) {
  return SBPS_PATHS[name];
}

module.exports = {
  getHeroId,
  addPlayerToDB,
  rbf2json,
  getSbpsPathFromName
}
