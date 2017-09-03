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
var Post = require('../db/models/Post');
var PostVote = require('../db/models/PostVote');
var Utils = require('./utils');
var moment = require('moment');
const allowedHosts = require('config').get('allowedHosts');

module.exports = function(app) {
    function isLoggedInApi(req, res, next) {
        if (req.isAuthenticated())
            return next();

        return res.status(401).send({ ok: false, error: res.__('api.response.noauth') });
    }

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        return res.redirect('/');
    }

    function renderPostPage(req, res, post, author, vote) {
        Utils.renderPage(req, res, 'post', post.title, {
            post: post,
            author: author,
            vote: vote,
            moment: moment
        })
    }

    function render404Page(req, res, postID, err) {
        Utils.renderPage__(req, res, 'post_404', 'page.post_404.title', { postID: postID, error: err }, 404)
    }

    app.get('/p', isLoggedIn, function(req, res) {
        Utils.renderPage__(req, res, 'upload_post', 'page.uploadpost.title', {
            allowedHosts: allowedHosts
        });
    });

    app.post('/p', isLoggedInApi, function(req, res) {
        // TODO: Implement this
        res.status(500).send({ ok: false, error: res.__('api.response.notimplemented', 'POST /p') });
    });

    app.get('/p/:postID', function(req, res) {
        var postID = req.params.postID;
        Post.findById(postID)
            .then(function(post) {
                post.getAuthor()
                    .then(function(author) {
                        if (req.isAuthenticated()) {
                            PostVote.findOne({
                                where: {
                                    postID: postID,
                                    userID: req.user.twitterID
                                }
                            }).then(function(vote) {
                                renderPostPage(req, res, post, author, vote);
                            }).catch(function(err) {
                                renderPostPage(req, res, post, author);
                            });
                        } else {
                            renderPostPage(req, res, post, author);
                        }
                    })
                    .catch(function(err) {
                        render404Page(req, res, postID, err);
                    })
                ;
            })
            .catch(function(err) {
                render404Page(req, res, postID, err);
            })
        ;
    });

    app.post('/p/:postID/vote', isLoggedInApi, function(req, res) {
        var postID = req.params.postID;
        Post.findById(postID)
            .then(function(post) {
                var userID = req.user.twitterID;
                PostVote.findOne({
                    where: {
                        postID: postID,
                        userID: userID
                    }
                }).then(function(vote) {
                    // Voted, remove Vote
                    vote.destroy();
                    res.status(204).send();
                }).catch(function(err) {
                    // Not Voted, create Vote
                    PostVote.create({
                        postID: postID,
                        userID: userID
                    }).then(function(vote) {
                        res.status(204).send();
                    }).catch(function(err) {
                        res.status(500).send({ ok: false, error: err })
                    })
                });
            })
            .catch(function(err) {
                res.status(404).send({ ok: false, error: err })
            })
        ;
    });
};
