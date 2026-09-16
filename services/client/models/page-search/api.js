const {logger} = require('../../lib/logger.js');
const model = require('./model.js');
const express = require('express');
const router = express.Router();


router.get(/\/_\/.*/, async (req, res) => {
  let path = req.path.replace('/_/', '/');

  try {
    res.json(await model.get(path));
  } catch(e) {
    logger.error(e);
    res.status(500).json({
      stack : e.stack,
      error: e.message
    });
  }
});

router.get('/', handleSearch);
router.post('/', handleSearch);

async function handleSearch(req, res) {
  try {
    let searchDocument = req.query || req.body;
    let results = await model.search(searchDocument);
    res.json(results);
  } catch(e) {
    logger.error(e);
    res.status(500).json({
      stack : e.stack,
      error: e.message
    });
  }
}

router.get('/ia', handleIaSearch);
router.post('/ia', handleIaSearch);

async function handleIaSearch(req, res) {
  try {
    let searchDocument = req.query || req.body;
    
    // map possible ia reader params to our params
    if( !searchDocument.id ) {
      searchDocument.id = searchDocument.item_id || searchDocument.doc || searchDocument.path;
    }
    if( !searchDocument.text ) {
      searchDocument.text = searchDocument.q;
    }
    
    let results = await model.iaSearch(searchDocument);

    // if callback, return jsonp
    if( searchDocument.callback ) {
      res.set('Content-Type', 'text/javascript');
      res.send(searchDocument.callback + '(' + JSON.stringify(results) + ')');
      return;
    }

    res.json(results);
  } catch(e) {
    logger.error(e);
    res.status(500).json({
      stack : e.stack,
      error: e.message
    });
  }
}

module.exports = router;