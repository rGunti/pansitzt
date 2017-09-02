var express = require('express');
var router = express.Router();

function renderPage(res, page, title, data) {
  res.render('templates/main', { page: page, title: res.__(title), data: data })
}

/* GET home page. */
router.get('/', function(req, res, next) {
    renderPage(res, 'home', 'page.home.title');
});

router.get('/imprint', function(req, res, next) {
    renderPage(res, 'imprint', 'page.imprint.title');
});

module.exports = router;
