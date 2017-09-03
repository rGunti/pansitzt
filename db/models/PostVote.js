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

const Sequelize = require('sequelize');
const db = require('../dbpool');
const User = require('./User');
const Post = require('./Post');

const PostVote = db.define('post_votes', {
    id: {
        field: 'id',
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postID: {
        field: 'post_id',
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    userID: {
        field: 'user_id',
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DataTypes.TIME
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DataTypes.TIME
    }
});

PostVote.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
PostVote.belongsTo(Post, { as: 'post', foreignKey: 'post_id' });

module.exports = PostVote;
