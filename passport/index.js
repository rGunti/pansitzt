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

var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConfig = require('config').get('twitter');
var debug = require('debug')('pansitzt:passport');

var User = require('../db/models/User');

module.exports = function(passport) {
    debug('Configuring Passport...');

    passport.serializeUser(function(user, done) {
        done(null, user.twitterID);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function (user) {
            done(null, user);
        }).catch(function(err) {
            done(err, null);
        });
    });

    passport.use(new TwitterStrategy({
        consumerKey: twitterConfig.consumerKey,
        consumerSecret: twitterConfig.consumerSecret,
        callbackURL: twitterConfig.callbackURL,
        includeEmail: true
    }, function(token, tokenSecret, profile, done) {
        process.nextTick(function() {
            User.findById(profile.id).then(function(user) {
                if (user) {
                    if (!user.blockedAt) {
                        var userNeedsUpdate = false;
                        if (user.handle !== profile.username) {
                            user.handle = profile.username;
                            userNeedsUpdate = true;
                        }
                        if (user.displayName !== profile.displayName) {
                            user.displayName = profile.displayName;
                            userNeedsUpdate = true;
                        }
                        if (user.email !== profile.emails[0].value) {
                            user.email = profile.emails[0].value;
                            userNeedsUpdate = true;
                        }
                        if (user.isVerified !== profile._json.verified) {
                            user.isVerified = profile._json.verified;
                            userNeedsUpdate = true;
                        }
                        if (userNeedsUpdate) {
                            user.save();
                        }

                        done(null, user);
                    } else {
                        done({
                            message: 'User blocked!',
                            redirectUrl: '/u/' + user.handle,
                            status: 403
                        });
                    }
                } else {
                    var newUser = new User();
                    newUser.twitterID = profile.id;
                    newUser.twitterToken = token;
                    newUser.handle = profile.username;
                    newUser.displayName = profile.displayName;
                    newUser.email = profile.emails[0].value;
                    newUser.isVerified = profile._json.verified;

                    newUser.save().then(function(user) {
                        done(null, user);
                    }).catch(function(err) {
                        debug('Failed to save user %s (@%s)', newUser.twitterID, newUser.handle);
                        done(err);
                    });
                }
            }).catch(function(err) {
                done(err);
            });
        });
    }));
};
