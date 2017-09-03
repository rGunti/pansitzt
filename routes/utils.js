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
            locale: req.getLocale()
        })
    }
};

module.exports = Utils;
