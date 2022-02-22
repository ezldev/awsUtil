import _ from 'lodash';
import { getAWSSecret } from '../utils/secretManager';
import { v4 as uuid } from 'uuid';
// var crypto = require('crypto');

let processed = false;

let config: any = {};
const devConfigFlattenObj = {
  CONFIG_1: 'config',
  'config.config2': 'config2'
};

async function setConfig() {
  if (processed) {
    return config;
  }
  let data;
  if (process.env.CODE_ENV) {
    data = await getAWSSecret('apps/nodejs-secrets');
  } else {
    data = devConfigFlattenObj;
  }
  if (!data) {
    throw { status: 401, message: 'Can not read secret manager' };
  }
  processed = true;
  for (const key in data) {
    _.set(config, key, data[key]);
  }
}

async function getConfig(key?) {
  await setConfig();
  if (key) {
    const value = _.get(config, key);
    if (!value) {
      throw { message: `SECRET_MANAGER_ENTRY_MISSING for ${key}` };
    }
    return value;
  }
  return config;
}

let _uuid: string;
function getUuid() {
  return _uuid;
}
function setUuid(newUuid?: string) {
  _uuid = newUuid || uuid();
}

export { getConfig, getUuid, setUuid };
