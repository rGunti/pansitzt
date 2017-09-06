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

var appVersion = require('../package.json').version;
var moment = require('moment');
var config = require('config');
var http = require('http');
var https = require('https');
var imageType = require('image-type');

var ALLOWED_HOSTS = config.get('allowedHosts');

const Post = require('../db/models/Post');

const Utils = {
    renderPage__: function(req, res, page, title, data, statusCode) {
        if (statusCode) {
            res.status(statusCode);
        }
        Utils.renderPage(req, res, page, res.__(title), data);
    },
    renderPage: function(req, res, page, title, data, statusCode) {
        if (statusCode) {
            res.status(statusCode);
        }
        res.render('templates/main', {
            page: page,
            title: title,
            data: data,
            isLoggedIn: req.isAuthenticated(),
            loggedInUser: req.user || null,
            version: appVersion,
            locale: req.getLocale(),
            utils: {
                moment: moment
            }
        })
    },
    renderMessages: function(req, messages) {
        var msgs = [];
        for (var i in messages) {
            var item = messages[i];
            if (item instanceof Array) {
                var origParams = item[1];
                var params = {};

                for (var key in origParams) {
                    var v = origParams[key];
                    if (typeof v === 'string') {
                        params[key] = (v.startsWith('#') ? req.__(v.substr(1)) : v);
                    } else {
                        params[key] = v;
                    }
                }

                msgs.push(req.__(item[0], params));
            } else if (typeof item === "string") {
                msgs.push(req.__(item));
            }
        }
        return msgs;
    },
    extractHostnameFromUrl: function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    },
    validatePost: function(post, messages) {
        var startErrorCount = messages.length;

        if (!post.title) {
            messages.push(['api.validation.fieldempty', { field: '#object.post.title' }]);
        } else if (post.title.length < 5) {
            messages.push(['api.validation.fieldshort', { field: '#object.post.title', len: 5 }]);
        }

        if (!post.source) {
            messages.push(['api.validation.fieldempty', { field: '#object.post.url' }]);
        } else {
            // Validate URL
            var url = post.source;
            var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
            var regex = new RegExp(urlRegex);
            if (!url.match(regex)) {
                messages.push(['api.validation.fieldurl', { field: '#object.post.url' }]);
            } else {
                var hostname = Utils.extractHostnameFromUrl(url);
                if (ALLOWED_HOSTS.indexOf(hostname) < 0) {
                    messages.push(['api.validation.unallowedhost', { host: hostname }]);
                }
            }
        }

        return (messages.length === startErrorCount);
    },
    checkUrlImage: function(url, messages, success, error) {
        function httpSuccess(res) {
            res.once('data', function(chunk) {
                res.destroy();
                var result = imageType(chunk);
                if (!result) {
                    messages.push('api.validation.notanimage');
                    if (error) error(messages);
                } else {
                    if (success) success(messages);
                }
            });
        }
        function httpError(e) {
            messages.push('api.validation.notanimage');
            if (error) error(messages);
        }

        if (url.startsWith('https://')) {
            https.get(url, httpSuccess).on('error', httpError);
        } else {
            http.get(url, httpSuccess).on('error', httpError);
        }
    },
    generatePostID: function(len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    checkNewPostID: function(post, successCallback) {
        var newPostID = Utils.generatePostID(8);
        Post.findById(post.postID)
            .then(function(p) {
                if (p) {
                    Utils.checkNewPostID(post, successCallback);
                } else {
                    if (successCallback) successCallback(newPostID);
                }
            })
            .catch(function(err) {
                if (successCallback) successCallback(newPostID);
            })
        ;
    },
    generateObjectMap: function(objArray, idField) {
        var objMap = {};
        for (var i in objArray) {
            var o = objArray[i];
            objMap[o[idField]] = o;
        }
        return objMap;
    },
    generateIDArray: function(objArray, idField) {
        var idArray = [];
        for (var i in objArray) {
            var o = objArray[i];
            idArray.push(o[idField]);
        }
        return idArray;
    }
};

module.exports = Utils;
