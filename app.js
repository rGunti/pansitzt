var config = require('config');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
// Configure Passport
require('./passport/index')(passport);

var index = require('./routes/index');
var users = require('./routes/users');

var i18n = require('i18n');
i18n.configure({
    locales: config.get('locales'),
    directory: __dirname + '/locales',
    queryParam: 'lang',
    defaultLocale: config.get('defaultLocale')
});

var app = express();

var debug = require('debug')('pansitzt:APP');
debug('Now running %s (instance %s)', config.get('appName'), process.env.NODE_ENV);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

// Setup Passport
app.use(session({ secret: 'pansitztsessionsecretisfuckinghardtocrack111elf' }));
app.use(passport.initialize());
app.use(passport.session());

// Setup Routes
app.use('/', index);
require('./routes/auth')(app, passport);
require('./routes/posts')(app);
require('./routes/errors')(app);

module.exports = app;
