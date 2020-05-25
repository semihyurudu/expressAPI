var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
var fs = require('fs')
var config = require('../config')
const cors = require('cors')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
  res.send('POST isteği geldi!')
})

router.post('/token-verify', cors(), function (req, res) {

  const { token } = req.body;

  try {
    jwt.verify(token, fs.readFileSync('./public.pem'), { algorithms: ['RS256'] })
    res.json({
      status: true
    })
  } catch(err) {
    res.status(500).json({
      status: false
    })
  }

})


module.exports = router;
