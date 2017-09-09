/*********************************************************************************** *
 * MIT License
 *
 * Copyright (c) 2017 Raphael "rGunti" Guntersweiler
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
 * ********************************************************************************* */

const VUser = require('../db/models/VUser');
const Utils = require('./utils');

const PAGE_SIZE = 15;

module.exports = function(app) {
    function isLoggedInApi(req, res, next) {
        if (req.isAuthenticated())
            return next();

        return res.status(401).send({ ok: false, error: res.__('api.response.noauth') });
    }

    function isLoggedInAsAdminApi(req, res, next) {
        VUser.findOne({
            where: {
                handle: req.user.handle,
                isAdmin: true,
                isBlocked: false
            }
        }).then(function(user) {
            if (user) {
                next();
            } else {
                res.status(401).send({ ok: false, error: res.__('api.response.noperm') });
            }
        }).catch(function(err) {
            res.status(401).send({ ok: false, error: res.__('api.response.noperm') });
        });
    }

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        return res.redirect('/');
    }

    function isLoggedInAsAdmin(req, res, next) {
        VUser.findOne({
            where: {
                handle: req.user.handle,
                isAdmin: true,
                isBlocked: false
            }
        }).then(function(user) {
            if (user) {
                next();
            } else {
                res.redirect('/');
            }
        }).catch(function(err) {
            res.redirect('/');
        });
    }


    function userList(req, res) {
        var page = (req.params.page - 1) || 0;
        if (page < 0) { page = 0; }
        var offset = Math.abs(PAGE_SIZE * page);
        VUser.count()
            .then(function(userCount) {
                if (userCount) {
                    VUser.findAll({
                        offset: offset,
                        limit: PAGE_SIZE,
                        order: [ [ 'handle', 'ASC' ] ]
                    }).then(function(users) {
                        Utils.renderPage__(req, res, 'admin_users', 'page.admin.action.users', {
                            users: users,
                            count: userCount,
                            currentPage: (page + 1),
                            pageSize: PAGE_SIZE,
                            maxPages: Math.ceil(userCount / PAGE_SIZE)
                        });
                    }).catch(function(err) {
                        throw err;
                    });
                } else {
                    throw null;
                }
            })
            .catch(function(err) {
                throw err;
            });
    }


    app.get('/a', isLoggedIn, isLoggedInAsAdmin, function(req, res) {
        Utils.renderPage__(req, res, 'admin', 'page.admin.title');
    });

    app.get('/a/users', isLoggedIn, isLoggedInAsAdmin, userList);
    app.get('/a/users/:page', isLoggedIn, isLoggedInAsAdmin, userList);

    app.get('/a/reports', isLoggedIn, isLoggedInAsAdmin, function(req, res) {
        Utils.renderPage__(req, res, 'admin_reports', 'page.admin.action.reports');
    });
};
