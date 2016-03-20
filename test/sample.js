var all_config = require('./config.json');
var utils = require('nucleus-utils')( { config: all_config });
var modelFactory = require('..');

var models = modelFactory.generateModelMap( require('./edge-data-model.json'), utils );

console.log( models );