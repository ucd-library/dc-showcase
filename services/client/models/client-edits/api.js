const {Router} = require('express');
const model = require('./model.js');

let router = Router();


router.get(/^\/.*/, async (req, res) => {
  try {
    res.json(await model.get(req.url));
  } catch(e) {
    res.status(500).send({
      error : e.message,
      stack : e.stack
    });
  }
});


module.exports = router;