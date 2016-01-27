var urljoin = require('url-join');

function modelFactory( options ) {
  //console.log( options )
  var config = options.config;
  function getHyperLinks( options ) {
    return function () {
      var that = this;
      var hyperlinks = [];
      var self = {
        "rel": ["self"],
        "href": urljoin( config.hateoas.url, config.hateoas.basepath, options.path, this.get('id') )
      };
      var includeHyperLinks = options.associations.map(function (assoc) {
        return {
          "rel": [assoc.rel],
          "href": urljoin(config.hateoas.url, config.hateoas.basepath, options.path,
              that.get('id'), '?include=' + encodeURIComponent('[{"name":"' + assoc.rel + '"}]'))
        }
      });
      var customHyperLinks = options.customHyperLinks && options.customHyperLinks.bind( that )() || [];
      return( hyperlinks.concat( self, includeHyperLinks, customHyperLinks ) );
    }
  }

  function getAssociations(assocs) {
    return {
      associate: function (models) {
        var that = this;
        assocs.forEach(function (assoc) {
          that[ assoc.type ]( models[ assoc.modelName ], { foreignKey: assoc.foreignKey, targetKey: assoc.targetKey } )
        })
      }
    }
  };

  function generateModel(options) {
    var model = options.sequelize.define(
        options.model,
        {
          links: {
            type: new options.DataTypes.VIRTUAL(options.DataTypes.STRING),
            get: getHyperLinks( options )
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
    model.listAttributes = options.listAttributes;
    model.path = options.path;
    return model;
  };

  return {
    generateModel: generateModel
  }
}

module.exports = modelFactory;
