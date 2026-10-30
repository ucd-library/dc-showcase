const { Router } = require('express');
const model = require('./model.js');
const createDefaultApi = require('../../lib/es-default-api.js');
const archive = require('../../lib/archive.js');
const { logger } = require('../../lib/logger.js');

const router = Router();

// zip of item files, before the GET /* item lookup
router.get('/archive', async (req, res) => {
  try {
    await archive.streamArchive(res, req.query.paths || [], { name: req.query.name });
  } catch(e) {
    logger.error('Error creating archive', e);
    if( !res.headersSent ) res.status(500).json({ error: true, message: 'Error creating archive' });
    else res.destroy(e);
  }
});

module.exports = createDefaultApi(model, { router });
