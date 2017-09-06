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
var VUser = require('../db/models/VUser');
var Post = require('../db/models/Post');
var VPost = require('../db/models/VPost');
var PostVote = require('../db/models/PostVote');

var twitterConfig = require('config').get('twitter');
var debug = require('debug')('pansitzt:routes/auth');

const POST_PAGE_SIZE = 4;

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

    function renderPostList(req, res, userPost, posts, votes, page, offset) {
        Utils.renderPage(req, res,
            'post_list', req.__('page.post_list_by_user.title', userPost),
            {
                posts: posts,
                postCount: Object.keys(posts).length,
                votes: votes,
                byUser: userPost,
                page: (page + 1),
                maxPages: Math.ceil(userPost.postCount / POST_PAGE_SIZE),
                postPageCount: POST_PAGE_SIZE,
                offset: offset
            });
    }

    function getUserPostList(req, res) {
        var twitterHandle = req.params.handle;
        var page = (req.params.page - 1) || 0;
        if (page < 0) { page = 0; }
        var offset = Math.abs(POST_PAGE_SIZE * page);
        VUser.findOne({
            where: { handle: twitterHandle }
        }).then(function(vuser) {
            VPost.findAll({
                where: { authorID: vuser.twitterID },
                order: [ [ 'created_at', 'DESC' ] ],
                offset: offset,
                limit: POST_PAGE_SIZE
            }).then(function(posts) {
                var idList = [];
                var postMap = {};
                for (var i in posts) {
                    idList.push(posts[i].postID);
                    postMap[posts[i].postID] = posts[i];
                }

                if (req.isAuthenticated()) {
                    PostVote.findAll({
                        where: { postID: { $in: idList }, userID: req.user.twitterID }
                    }).then(function(votes) {
                        var voteMap = {};
                        for (var i in votes) {
                            voteMap[votes[i].postID] = votes[i];
                        }
                        renderPostList(req, res, vuser, postMap, voteMap, page, offset);
                    });
                } else {
                    renderPostList(req, res, vuser, postMap, null, page, offset);
                }
            });
        }).catch(function(err) {
            Utils.renderPage__(req, res, 'profile_404', 'page.profile.title', {
                userHandle: twitterHandle
            }, 404);
        });
    }

    app.get('/u', isLoggedIn, function(req, res) {
        res.redirect('/u/' + req.user.handle);
    });

    app.get('/u/:handle', function(req, res) {
        var twitterHandle = req.params.handle;
        VUser.findOne({
            where: { handle: twitterHandle }
        }).then(function(vuser) {
            showUserInfo(req, res, vuser);
        }).catch(function(err) {
            Utils.renderPage__(req, res, 'profile_404', 'page.profile.title', {
                userHandle: twitterHandle
            }, 404);
        });
    });

    app.get('/u/:handle/posts', getUserPostList);
    app.get('/u/:handle/posts/:page', getUserPostList);

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
