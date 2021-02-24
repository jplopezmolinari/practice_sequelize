'use strict';

var config = require('../config.json');
var Sequelize = require('sequelize');

module.exports = new Sequelize(config.database, config.username, config.password, config);
