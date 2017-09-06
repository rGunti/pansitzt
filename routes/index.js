var express = require('express');
var router = express.Router();
var Utils = require('./utils');

/* GET home page. */
//router.get('/', function(req, res, next) {
//    Utils.renderPage__(req, res, 'home', 'page.home.title');
//});

router.get('/imprint', function(req, res, next) {
    Utils.renderMarkdownPage(req, res, 'page.imprint.title', 'imprint');
});

router.get('/about', function(req, res, next) {
    Utils.renderMarkdownPage(req, res, 'page.about.title', 'about');
});

router.get('/tos', function(req, res, next) {
    Utils.renderMarkdownPage(req, res, 'page.tos.title', 'tos');
});

module.exports = router;
