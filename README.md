# nucleus-model-factory
This module generates Sequelize.js models based on JSON configuration. Models are used in combination with Express.js routes.

```javascript
"use strict";
var config_all = require(__dirname + '/../config/config.json');
var env = process.env.NODE_ENV || config_all.default_environment;
var config = require('../config/config.json')[ env ];
var modelFactory = require('nucleus-model-factory');
var urljoin = require('url-join');


module.exports = function( sequelize, DataTypes ) {
  var modelConf = {
    model: 'Org',
    name: 'Apigee Org',
    path: '/orgs',
    config: config,
    listAttributes: ["id", "org_name", "account_id", "account_name", "org_type", "paid"],
    //{"org_name": DataTypes.STRING, "account_id": DataTypes.STRING,
    //  "account_name": DataTypes.STRING, "org_type": DataTypes.STRING, "paid": DataTypes.BOOLEAN },
    sequelize: sequelize,
    associations: [
      {
        rel: 'apis',
        foreignKey: 'org_name',
        modelName: 'OrgApi',
        type: 'hasMany'
      }
    ],
    schema: 'edge',
    table: 'mt_org',
    DataTypes: DataTypes,
    customHyperLinks:
        function( ) {
          var orgApi = sequelize.import('../models/org_api');
          return [{
            "rel": ["apis_absolute_path"],
            "href": urljoin(config.hateoas.url, config.hateoas.basepath, modelConf.path, this.get('id'), orgApi.path )
          }]
        },
  };
  var mf = new modelFactory( modelConf );
  var Org = mf.generateModel( modelConf );

  //var modelSwagger = utils.generateSwagger(modelConf)

  return Org;
};


```