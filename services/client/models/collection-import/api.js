const {logger} = require('@ucd-lib/fin-service-utils');
const model = require('./model.js');
const {Router} = require('express');

let router = Router();

router.get('/', async (req, res) => {
  try {
    res.json(await model.list()); 
  } catch(e) {
    errorResponse(res, e, 'Error with list retrieval');
  }
});

router.get('/:collection', async (req, res) => {
  try {
    res.json(await model.get(req.params.collection)); 
  } catch(e) {
    errorResponse(res, e, 'Error getting collection status: '+req.params.collection);
  }
});

router.post('/:collection', async (req, res) => {
  try {
    if( req.query.ignoreBinarySync ) {
      req.query.ignoreBinarySync = req.query.ignoreBinarySync === 'true';
    }
    if( req.query.agent && req.query.agent !== 'protected' ) {
      delete req.query.agent;
    }
    res.json(await model.import(req.params.collection, req.query)); 
  } catch(e) {
    errorResponse(res, e, 'Error importing collection: '+req.params.collection);
  }
});

router.delete('/:collection', async (req, res) => {
  try {
    res.json(await model.delete(req.params.collection)); 
  } catch(e) {
    errorResponse(res, e, 'Error deleting collection: '+req.params.collection);
  }
});

function errorResponse(res, e, message) {
  logger.error(message, e);
  res.status(500).json({
    error: true, 
    message, 
    details : {
      message : e.message,
      stack : e.stack
    }
  });
}

module.exports = router;