var express = require('express');
var router = express.Router();
var Utils = require('./utils');

/* GET home page. */
router.get('/', function(req, res, next) {
    Utils.renderPage(req, res, 'home', 'page.home.title');
});

router.get('/imprint', function(req, res, next) {
    Utils.renderPage(req, res, 'imprint', 'page.imprint.title');
});

module.exports = router;
