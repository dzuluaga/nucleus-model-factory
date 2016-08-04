var urljoin = require('url-join');
var debug = require('debug')('nucleus-model-factory');


function modelFactory() {
  function getHyperLinks( options, config, sequelize ) {
    return function () {
      //debug('getHyperLinks', this.$options.links);
      var hyperlinks = [];
      if (!this.$options.links) return hyperlinks;
      var that = this;
      var self = {
        "rel": ["self"],
        "href": urljoin( config.hateoas.url, config.hateoas.basepath, options.path, this.get('id') )
      };
      var includeHyperLinks = ( options.associations || [] ).map(function (assoc) {
        var hlinks = [];
        if( assoc.operator != "$like"  ) {
          hlinks.push({
            "rel": [assoc.rel.concat("_include")],
            "href": urljoin(config.hateoas.url, config.hateoas.basepath, options.path,
                that.get('id'), '?include=' + encodeURIComponent('[{"name":"' + sequelize.models[assoc.modelName].includeAlias + '"}]'))
          });
        }
        if( assoc.type === 'hasMany' ) {
          hlinks.push({
            "rel": [assoc.rel.concat('_absolute_path')],
            "href": urljoin(config.hateoas.url, config.hateoas.basepath, options.path,
                that.get('id'), sequelize.models[assoc.modelName].path)
          });
        }
        return hlinks;
      });

      var customHyperLinks = options.customHyperLinks && options.customHyperLinks.bind( that )() || [];
      var flat_arr = [].concat.apply([], hyperlinks.concat( self, includeHyperLinks, customHyperLinks ));
      return flat_arr;
      //return( hyperlinks.concat( self, includeHyperLinks, customHyperLinks ) );
    }
  }

  function getAssociations( assocs ) {
    return {
      associate: function (models) {
        var that = this;
        ( assocs || [] ).forEach(function (assoc) {
          that[ assoc.type ]( models[ assoc.modelName ], { foreignKey: assoc.foreignKey, targetKey: assoc.targetKey } )
        })
      }
    }
  };

  function generateModel( _options  ) {
    var db_to_use = _options.modelConf.dbConnection || 'sequelize';
    var options = _options.modelConf, sequelize = _options.utils.db_connections[ db_to_use ],
        config = _options.utils.getConfig(), Sequelize = _options.utils.db_connections.Sequelize;
    debug( 'generating model for ', options.model,' with database connection ', db_to_use );
    if( !options.includeAlias ) { throw new Error('Set includeAlias attribute from the model.'); };
    var model = sequelize.define(
        options.model,
        {
          links: {
            type: new Sequelize.VIRTUAL( Sequelize.STRING ),
            get: getHyperLinks( options, config, sequelize )
          }
        },
        {
          freezeTableName: true,
          timestamps: false,
          tableName: options.table,
          schema: options.schema,
          classMethods: getAssociations(options.associations)
        });
    options.path = options.path || urljoin( '/', model.options.name.plural.toLowerCase()) ;
    debug('getting listAtrribute', options.listAttributes);
    model.listAttributes = Object.keys( options.listAttributes ).map( function ( key ) { return key; });
    model.path = options.path;
    model.includeAlias = options.includeAlias;
    return model;
  };

  function generateModelMap( specModels, utils ) {
    var models = {};
    specModels.models.forEach(function( specModel ) {
      var model = generateModel( { modelConf: specModel, utils: utils } );
      models[ model.name ] = model;
    });
    Object.keys( models ).forEach(function ( modelName ) {
      if ( models[ modelName ].associate ) {
        models[ modelName ].associate( models );
      }
    });
    return models;
  }

  module.exports = {
    generateModel: generateModel,
    generateModelMap: generateModelMap
  }
  return module.exports;
}

module.exports = modelFactory();
