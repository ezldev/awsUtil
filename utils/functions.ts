import { Handler, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';

const wrapper = (handler: Handler) =>
  async function (req, res, next) {
    if (!hasValidPermission(req)) {
      throw { message: 'Not authorized', status: StatusCodes.UNAUTHORIZED };
    }
    const result = await handler(req, res, next);
    if (!res.headersSent) {
      res.json(result);
    }
  };

type OperationDocType = { operationDoc: { 'x-permissions'?: string[]; 'x-title-codes'?: string[] } };

function hasValidPermission(req: RequestWithAuth & OperationDocType) {
  if (req.operationDoc['x-permissions'] && req.operationDoc['x-title-codes']) {
    return validTitleCodePermissions() || validXPermissions();
  } else if (req.operationDoc['x-title-codes']) {
    return validTitleCodePermissions();
  } else if (req.operationDoc['x-permissions']) {
    return validXPermissions();
  }

  return true;

  function validTitleCodePermissions() {
    const allowedTitleCodes = req.operationDoc['x-title-codes'];
    const userTitleCodes = [req.user?.user?.data?.titleCode];
    return hasPermission(userTitleCodes, allowedTitleCodes);
  }

  function validXPermissions() {
    const allowedPermissions = req.operationDoc['x-permissions'];
    const userPermissions = req.user?.user?.permissions;
    return hasPermission(userPermissions, allowedPermissions);
  }

  function hasPermission(userPermissions: string[], xPermissions: string[]) {
    if (userPermissions.includes('SchedulingAdmin')) return true;
    return userPermissions.some(p => xPermissions.includes(p));
  }
}

// Operations for OpenAPI 3. need go wrap permission check logic here. as express-openApi doesn't provide and way to inject custom middleware
export function getApiOperations(operationMap: { [key: string]: any }) {
  const operations = {};
  for (const type in operationMap) {
    if (typeof operationMap[type] === 'function') operations[type] = wrapper(operationMap[type]);
    else {
      for (const operation in operationMap[type]) {
        operations[`${type}.${operation}`] = wrapper(operationMap[type][operation]);
      }
    }
  }
  return operations;
}

export function errorMiddleware(err, req, res, next) {
  // TODO: check console.error output in aws. console.error spit too much when running locally
  console.log({ message: err.message, status: err.status, stack: err.stack });
  const status = err.status || StatusCodes.BAD_REQUEST;
  const message = err.message || err.response || err;

  if (message?.errors && message.errors[0].path && message.errors[0].errorCode) {
    const error = message.errors[0];
    const msg = `Path: ${error.path} | Error: ${error.message} | Code: ${error.errorCode}`;
    res.status(status).json({ message: msg, status });
  } else {
    res.status(status).json({ message, status });
  }
}

export function getSignedUrl(
  s3: AWS.S3,
  operation: 'getObject' | 'putObject' | 'postObject',
  params: any
): Promise<string> {
  if (operation === 'getObject' || operation === 'putObject') {
    return new Promise((resolve, reject) => {
      s3.getSignedUrl(operation, params, callback(resolve));
    });
  } else {
    return new Promise((resolve, reject) => {
      s3.createPresignedPost(params, callback(resolve));
    });
  }

  function callback(resolve) {
    return (err: Error, data: AWS.S3.PresignedPost | string) => {
      if (err) {
        throw err;
      } else {
        resolve(data);
      }
    };
  }
}

export type RequestWithAuth = Request & UserRequestObj & { operationDoc: { [key: string]: any } };

export type UserRequestObj = {
  user: {
    user: {
      userId: string;
      email: string;
      data: {
        titleCode: string;
        vendorId?: number;
        areaCode?: string;
        employeeID?: number;
      };
      permissions: any[];
      sosAdminId?: number;
    };
  };
};

export function getCreatedByUserFromAuthToken(request: RequestWithAuth) {
  if (!request.user || !request.user.user) throw { message: 'User is not available' };
  const user = request.user.user;
  return user.userId || user.email;
}

export function validateAllResponses(req, res, next) {
  const strictValidation = req.apiDoc['x-express-openapi-validation-strict'] ? true : false;
  if (typeof res.validateResponse === 'function') {
    const send = res.send;
    res.send = function expressOpenAPISend(...args) {
      const onlyWarn = !strictValidation;
      if (res.get('x-express-openapi-validation-error-for') !== undefined) {
        return send.apply(res, args);
      }
      const body = args[0];
      let validation = res.validateResponse(res.statusCode, body);
      let validationMessage;
      if (validation === undefined) {
        validation = { message: undefined, errors: undefined };
      }
      if (validation.errors) {
        const errorList = Array.from(validation.errors)
          .map((_: any) => _.message)
          .join(',');
        validationMessage = `Invalid response for status code ${res.statusCode}: ${errorList}`;
        console.warn(validationMessage);
        // Set to avoid a loop, and to provide the original status code
        res.set('x-express-openapi-validation-error-for', res.statusCode.toString());
      }
      if (onlyWarn || !validation.errors) {
        return send.apply(res, args);
      } else {
        res.status(500);
        return res.json({ error: validationMessage });
      }
    };
  }
  next();
}
