const _ = require('lodash');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(process.cwd() + '/swagger/dashboard.yaml');

_.forOwn(swaggerDocument.paths, (path, key) => {
  _.forOwn(path, (spec, method) => {
    if (_.intersection(['Internal'], spec.tags).length) {
      delete path[method];
    }
  });
});
swaggerDocument.tags = _.omit(swaggerDocument.tags, 'Internal');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
export { app };
