const express = require('express');
const { getSbpsPathFromName, rbf2json } = require('../functions');
const logger = require('../logger');
const { checkCache } = require('../middleware/checkCache');
const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'no model id given' });
  }

  let sbps_path = getSbpsPathFromName(id);

  try {
    let sbps = await rbf2json(sbps_path);
    let ebps = await rbf2json(`simulation\\attrib\\${sbps.squad_loadout_ext.unit_list[0].squad_loadout_unit_entry.type}.rbf`);

    res.status(200).json({ id, sbps, ebps });
  } catch (error) {
    logger.error(error.message ?? error);
    res.status(500).json({ error: error.message ?? error });
  }

});

module.exports = router;
