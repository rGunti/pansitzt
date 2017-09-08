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


const REPORT_REASONS = [
    'UNDEF' // Undefined
    ,'NOFIT' // Does not fit topics
    ,'PORNC' // Pornographic Content
    ,'ILLEG' // Illegal Content
    ,'OFFEN' // Offensive Content
    ,'DRUGS' // Drug Abuse
    ,'RADIC' // Radical political / religious Content
];

const REPORT_RESOLUTIONS = [
    'UNDEF' // Undefined
    ,'DELPS' // Post deleted
    ,'SUSPA' // Account suspended
    ,'OTHER' // Other Resolution
];

var Report = db.define('reports', {
    reportID: {
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
    reportedByUserID: {
        field: 'reported_by_id',
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    reason: {
        field: 'reason',
        type: Sequelize.DataTypes.ENUM,
        values: REPORT_REASONS,
        allowNull: false
    },
    commentText: {
        field: 'comment_text',
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [10, 500]
        }
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DataTypes.TIME,
        allowNull: false
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DataTypes.TIME,
        allowNull: false
    },
    completedAt: {
        field: 'completed_at',
        type: Sequelize.DataTypes.TIME,
        allowNull: true
    },
    completedByUserID: {
        field: 'completed_by_id',
        type: Sequelize.DataTypes.STRING,
        allowNull: true
    },
    resolutionType: {
        field: 'resolution_type',
        type: Sequelize.DataTypes.ENUM,
        values: REPORT_RESOLUTIONS,
        allowNull: true
    },
    resolutionComment: {
        field: 'resolution_comment',
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 500]
        }
    }
});

Report.REPORT_REASONS = REPORT_REASONS;
Report.REPORT_RESOLUTIONS = REPORT_RESOLUTIONS;

Report.belongsTo(User, { as: 'reportedByUser', foreignKey: 'reported_by_id' });

module.exports = Report;
