const st = new Date().getTime();
import helmet from 'helmet';
import express from 'express';
import createMiddleware from 'swagger-express-middleware';
import _ from 'lodash';
import * as operationMap from './controllers';
//import { setOneLogin, authentication } from '../utils/oneLogin-auth';
import { sanitizeBodyMiddleware } from '../utils';
import bodyParser from 'body-parser';
import compression from 'compression';

let appReady = false;
let app = express();
app.use(compression());

app.use(function (req, res, next) {
  if (appReady) {
    return next();
  }
  let interval = setInterval(() => {
    if (appReady) {
      clearInterval(interval);
      next();
    }
  }, 1);
});
app.use(helmet());
//setOneLogin(app);

createMiddleware('swagger/dashboard.yaml', app, function (err, middleware) {
  // Add all the Swagger Express Middleware, or just the ones you need.
  // NOTE: Some of these accept optional options (omitted here for brevity)
  app.use(
    middleware.metadata(),
    middleware.CORS(),
    //authentication,
    bodyParser.json(),
    sanitizeBodyMiddleware,
    // middleware.files(),
    middleware.parseRequest({ json: { limit: '50mb', extended: true } })
    //middleware.validateRequest()
    // middleware.mock()
  );

  app.use(function (req: any, res, next) {
    console.log(req);
    //const handler = _.get(operationMap, req.swagger.operation.operationId);
    const handler = operationMap.getAllHelpInfo;
    if (!handler) {
      return next();
    }
    handler(req, res, next);
  });

  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.json({ status: err.status, message: err.message, stack: err.stack });
  });
  appReady = true;
});

export { app };
