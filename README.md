# nucleus-model-factory
This module generates Sequelize.js models based on JSON configuration. Models are used in combination with Express.js routes.

### Installation

```bash
npm install nucleus-model-factory --save
```

### Using the API

The example below uses edge-data-model.json file to represent the tables within the database. ```modelFactory.generateModelMap``` generates an actual Sequelize.js ORM (Object-Relational Mapping), which can be used with Sequelize.js [querying syntax](http://docs.sequelizejs.com/en/latest/docs/querying/) to apply CRUD operations.

```javascript
// ./test/sample.js

var all_config = require('./config.json');
var utils = require('nucleus-utils')( { config: all_config });
var modelFactory = require('nucleus-model-factory');

var models = modelFactory.generateModelMap( require('./edge-data-model.json'), utils );

console.log( models );
```

Will result in this:

```
$ node sample.js
{ Org: Org,
  OrgApi: OrgApi,
  OrgApiRevision: OrgApiRevision,
  OrgApiRevisionVersion: OrgApiRevisionVersion,
  OrgApiRevisionVersionPolicy: OrgApiRevisionVersionPolicy,
  OrgApiRevisionVersionProxy: OrgApiRevisionVersionProxy,
  OrgApiRevisionVersionResourceFile: OrgApiRevisionVersionResourceFile,
  AccountUserMap: AccountUserMap }
Executing (default): SELECT 1+1 AS result
connection to  sequelize  successful
```

