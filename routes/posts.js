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
var Utils = require('./utils');
var moment = require('moment');

module.exports = function(app) {
    app.get('/p/:postID', function(req, res) {
        var postID = req.params.postID;
        Post.findById(postID)
            .then(function(post) {
                post.getAuthor()
                    .then(function(author) {
                        Utils.renderPage(req, res, 'post', post.title, {
                            post: post,
                            author: author,
                            moment: moment
                        })
                    })
                    .catch(function(err) {
                        Utils.renderPage__(req,
                            res,
                            'post_404',
                            'page.post_404.title',
                            { postID: postID, error: err }
                        )
                    })
                ;
            })
            .catch(function(err) {
                Utils.renderPage__(req, res, 'post_404', 'page.post_404.title', { postID: postID, error: err })
            })
        ;
    });
};
