'use strict';

import _, { isNil } from 'lodash';

var AWS = require('aws-sdk');
import csv from 'csv-parser';
import zlib from 'zlib';
import logger from './utils/logger';

function checkApp(appName) {
  return !process.env.APP_NAME || process.env.APP_NAME.indexOf(appName) > -1;
}

const serverless = require('serverless-http');

switch (process.env.APP_NAME) {
  case 'dashboard':
    const dashboard = require('./dashboard').app;
    exports.dashboardHandler = serverless(dashboard);
    break;
}
