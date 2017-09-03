/*
 * Copyright (c) 2017, Raphael "rGunti" Guntersweiler
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

var Utils = require('./utils');
var Twitter = require('twitter');
var getBearerToken = require('get-twitter-bearer-token');
var User = require('../db/models/User');

var twitterConfig = require('config').get('twitter');
var debug = require('debug')('pansitzt:routes/auth');

module.exports = function (app, passport) {
    var client;
    getBearerToken(
        twitterConfig.consumerKey,
        twitterConfig.consumerSecret,
        function(err, res) {
            if (err) {
                debug('Error while getting Bearer Token!', err);
            } else {
                client = new Twitter({
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    bearer_token: res.body.access_token
                });
            }
        }
    );

    function showUserInfo(req, res, user) {
        client.get(
            'users/show',
            { user_id: user.twitterID }
        ).then(function(userInfo) {
            Utils.renderPage__(req, res, 'profile', 'page.profile.title', {
                profileImage: userInfo.profile_image_url_https,
                user: user,
                twitterUser: userInfo
            });
        }).catch(function(err) {
            Utils.renderPage__(req, res, 'profile', 'page.profile.title', {
                user: req.user
            });
        });
    }

    app.get('/u', isLoggedIn, function(req, res) {
        showUserInfo(req, res, req.user);
    });

    app.get('/u/:handle', function(req, res) {
        var twitterHandle = req.params.handle;
        User.findOne({
            where: { handle: twitterHandle }
        }).then(function(user) {
            showUserInfo(req, res, user);
        }).catch(function(err) {
            Utils.renderPage__(req, res, 'profile_404', 'page.profile.title', {
                userHandle: twitterHandle
            }, 404);
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/u',
            failureRedirect: '/'
        })
    );

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }
};
