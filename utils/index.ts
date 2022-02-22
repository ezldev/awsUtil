import _ from 'lodash';
import { SQS } from 'aws-sdk';
// export * from './mq';
// export * from './storePrinter';
// export * from './uploadToS3';
// export * from './html2pdf';
// export * from './mysql';
export * from './sendMessage';

// import { executeQuery } from './mysql';
// import * as base62 from './base62';
import * as functions from './functions';
//export { base62 };
export { functions };

export async function asyncForEach(array, callback) {
  try {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  } catch (e) {
    throw e;
  }
}

const jwt = require('jsonwebtoken');

export const tokenExpiryTime = 720;

const accessKeys = {};

const setFleet = (req, source) => {
  if (req && source.fleetAccount) {
    req.fleet = { fleetAccount: source.fleetAccount, fleetClientName: source.fleetClientName };
  }
};

export const removeEmpty = obj => {
  Object.keys(obj).forEach(
    key =>
      (obj[key] && typeof obj[key] === 'object' && removeEmpty(obj[key])) ||
      ((obj[key] === '' || obj[key] === null) && delete obj[key])
  );
  return obj;
};

export const removeNulls = obj => {
  Object.keys(obj).forEach(
    key => (obj[key] && typeof obj[key] === 'object' && removeNulls(obj[key])) || (obj[key] === null && delete obj[key])
  );
  return obj;
};

export const sanitizeBodyMiddleware = (req, res, next) => {
  if (req.body) {
    removeEmpty(req.body);
  }
  next();
};

export const decodeHtmlEntities = (encodedString, toUpperCase = false) => {
  if (!encodedString) return encodedString;
  var translate_re = /&(nbsp|amp|quot|lt|gt);/gi;
  var translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>',
    NBSP: ' ',
    AMP: '&',
    QUOT: '"',
    LT: '<',
    GT: '>'
  };
  let result = encodedString
    .replace(translate_re, function (match, entity) {
      return translate[entity];
    })
    .replace(/&#(\d+);/gi, function (match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
  if (toUpperCase) {
    result = result.toUpperCase();
  }
  return result;
};

export const toSnakeCase = str => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');
};

export const toCamelCase = str => {
  return str
    .split('_')
    .map((word, index) =>
      index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};
