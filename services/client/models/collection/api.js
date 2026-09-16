const model = require('./model.js');
const createDefaultApi = require('../../lib/es-default-api.js');
const { logger } = require('../../lib/logger.js');
const {Router} = require('express');

let router = Router();

router.get('/all-labels', async (req, res) => {
  try {
    let labels = await model.allLabels();
    res.json(labels);
  } catch(e) {
    logger.error(e);
    res.json({error: true, message: 'Error with '+model.id+' labels retrieval'});
  }
});

createDefaultApi(model, {router});

module.exports = router;
