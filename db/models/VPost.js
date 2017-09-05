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

const VPost = db.define('v_posts', {
    postID: {
        field: 'id',
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        validate: {
            is: ['[A-Za-z0-9]', 'i']
        }
    },
    authorID: {
        field: 'user_id',
        type: Sequelize.DataTypes.STRING
    },
    title: {
        field: 'title',
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    source: {
        field: 'source',
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    voteCount: {
        field: 'vote_count',
        type: Sequelize.DataTypes.INTEGER,
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

VPost.belongsTo(User, { as: 'author', foreignKey: 'user_id' });

module.exports = VPost;
