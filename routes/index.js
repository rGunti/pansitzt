var express = require('express');
var router = express.Router();

function renderPage(res, page, title, data) {
  res.render('templates/main', { page: page, title: title, data: data })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  renderPage(res, 'home', 'Home');
});

module.exports = router;
