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
var VPost = require('../db/models/VPost');
var PostVote = require('../db/models/PostVote');
var Report = require('../db/models/Report');
var Utils = require('./utils');
var moment = require('moment');
const allowedHosts = require('config').get('allowedHosts');

var recaptcha = require('express-recaptcha');
const recaptchaConfig = require('config').get('recaptcha');

const POST_PAGE_SIZE = 5;

module.exports = function(app) {
    recaptcha.init(recaptchaConfig.siteKey, recaptchaConfig.siteSecret);

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

    function renderPostReportPage(req, res, post) {
        Utils.renderPage(req, res, 'report_post', res.__('page.report_post.title', post), {
            post: post,
            reasons: Report.REPORT_REASONS,
            captcha: recaptcha.render()
        });
    }

    function render404Page(req, res, postID, err) {
        Utils.renderPage__(req, res, 'post_404', 'page.post_404.title', { postID: postID, error: err }, 404)
    }

    function renderApiMessages(req, res, messages) {
        var errorMessages = Utils.renderMessages(req, messages);
        res.status(400).send({
            ok: false,
            error: errorMessages
        });
    }

    function renderPostListPage(req, res, posts, votes, postCount, offset, morePostsCount) {
        Utils.renderPage(req, res, 'post_list', req.__('page.home.title'), {
            posts: posts,
            postCount: Object.keys(posts).length,
            totalPostCount: postCount,
            votes: votes,
            offset: offset,
            hasMorePosts: morePostsCount
        });
    }

    function processPostList(req, res, totalPostCount, posts, offsetPost) {
        var lastPost = posts[Math.max(posts.length - 1, 0)];
        var postMap = Utils.generateObjectMap(posts, 'postID');
        VPost.count({
            where: {
                createdAt: { $lt: lastPost.createdAt }
            }
        }).then(function(morePostCount) {
            if (req.isAuthenticated()) {
                PostVote.findAll({
                    where: {
                        postID: { $in: Utils.generateIDArray(posts, 'postID') },
                        userID: req.user.twitterID
                    }
                }).then(function(votes) {
                    var voteMap = Utils.generateObjectMap(votes, 'postID');
                    renderPostListPage(req, res, postMap, voteMap, totalPostCount, offsetPost, morePostCount);
                }).catch(function(err) {
                    throw err;
                });
            } else {
                renderPostListPage(req, res, postMap, null, totalPostCount, offsetPost, morePostCount);
            }
        }).catch(function(err) {
            throw err;
        });
    }

    function getHomePostList(req, res) {
        var offset = req.query.p || "";
        VPost.count().then(function(postCount) {
            if (offset) {
                VPost.findOne({
                    where: { postID: offset }
                }).then(function (offsetPost) {
                    if (offsetPost) {
                        VPost.findAll({
                            where: {
                                createdAt: {
                                    $lt: offsetPost.createdAt
                                }
                            },
                            order: [[ 'created_at', 'DESC' ]],
                            limit: POST_PAGE_SIZE
                        }).then(function(posts) {
                            processPostList(req, res, postCount, posts, offsetPost);
                        }).catch(function(err) {
                            throw err;
                        });
                    } else {
                        throw err;
                    }
                }).catch(function(err) {
                    VPost.findAll({
                        order: [ [ 'created_at', 'DESC' ] ],
                        limit: POST_PAGE_SIZE
                    }).then(function(posts) {
                        processPostList(req, res, postCount, posts);
                    }).catch(function(err) {
                        throw err;
                    });
                });
            } else {
                VPost.findAll({
                    order: [ [ 'created_at', 'DESC' ] ],
                    limit: POST_PAGE_SIZE
                }).then(function(posts) {
                    processPostList(req, res, postCount, posts);
                }).catch(function(err) {
                    throw err;
                });
            }
        }).catch(function(err) {
            throw err;
        });
    }

    function validateReCaptcha(req, res, next) {
        recaptcha.verify(req, function(error, data) {
            if (error) {
                res.status(400).send({ok: false, error: res.__('api.response.recaptcha.' + error)})
            } else {
                next();
            }
        });
    }

    app.get('/', getHomePostList);

    app.get('/p', isLoggedIn, function(req, res) {
        Utils.renderPage__(req, res, 'upload_post', 'page.uploadpost.title', {
            allowedHosts: allowedHosts,
            captcha: recaptcha.render()
        });
    });

    app.post('/p', isLoggedInApi, validateReCaptcha, function(req, res) {
        var post = {
            postID: '',
            title: req.body.title,
            authorID: req.user.twitterID,
            source: req.body.url
        };

        var messages = [];
        if (Utils.validatePost(post, messages)) {
            Utils.checkUrlImage(post.source, messages, function() {
                Utils.checkNewPostID(post, function(newPostID) {
                    post.postID = newPostID;
                    Post.create(post)
                        .then(function(p) {
                            res.status(200).send({
                                ok: true,
                                postID: p.postID
                            });
                        })
                        .catch(function(e) {
                            messages.push('api.response.dbfail');
                            renderApiMessages(req, res, messages);
                        })
                    ;
                });
            }, function(messages) {
                renderApiMessages(req, res, messages);
            });
        } else {
            renderApiMessages(req, res, messages);
        }
    });

    app.get('/p/:postID', function(req, res) {
        var postID = req.params.postID;
        VPost.findById(postID)
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

    app.get('/p/:postID/report', isLoggedIn, function(req, res) {
        var postID = req.params.postID;
        VPost.findById(postID)
            .then(function(post) {
                if (post) {
                    renderPostReportPage(req, res, post);
                } else {
                    render404Page(req, res, postID, err);
                }
            })
            .catch(function(err) {
                render404Page(req, res, postID, err);
            })
        ;
    });

    app.post('/p/:postID/report', isLoggedInApi, validateReCaptcha, function(req, res) {
        var postID = req.params.postID;
        setTimeout(function() {
            Post.findById(postID)
                .then(function(post) {
                    if (!post) {
                        res.status(404).send({ ok: false });
                    } else {
                        var report = {
                            reportedByUserID: req.user.twitterID,
                            postID: req.body.postID,
                            reason: req.body.reason,
                            commentText: req.body.comment
                        };

                        var messages = [];
                        if (Utils.validateReport(report, messages)) {
                            Report.create(report)
                                .then(function(r) {
                                    res.status(200).send({ ok: true, message: res.__('api.response.success.report') });
                                })
                                .catch(function(e) {
                                    messages.push('api.response.dbfail');
                                    renderApiMessages(req, res, messages);
                                })
                        } else {
                            renderApiMessages(req, res, messages);
                        }
                    }
                })
                .catch(function(err) {
                    res.status(404).send({ ok: false, error: err })
                });
        }, 1000)
    });

    app.post('/p/:postID/vote', isLoggedInApi, function(req, res) {
        var postID = req.params.postID;
        setTimeout(function() {
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
                        VPost.findOne({
                            where: { postID: postID }
                        }).then(function(post) {
                            res.status(200).send({
                                ok: true,
                                voteCount: post.voteCount
                            });
                        }).catch(function(err) {
                            res.status(500).send({ ok: false, error: err })
                        });
                    }).catch(function(err) {
                        // Not Voted, create Vote
                        PostVote.create({
                            postID: postID,
                            userID: userID
                        }).then(function(vote) {
                            VPost.findOne({
                                where: { postID: postID }
                            }).then(function(post) {
                                res.status(200).send({
                                    ok: true,
                                    voteCount: post.voteCount
                                });
                            }).catch(function(err) {
                                res.status(500).send({ ok: false, error: err })
                            });
                        }).catch(function(err) {
                            res.status(500).send({ ok: false, error: err })
                        })
                    });
                })
                .catch(function(err) {
                    res.status(404).send({ ok: false, error: err })
                })
            ;
        }, 1000);
    });
};
