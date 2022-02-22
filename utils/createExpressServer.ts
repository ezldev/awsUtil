import express, { Handler } from 'express';
import bodyParser from 'body-parser';
import { initialize } from 'express-openapi';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import noCache from 'nocache';
import helmet from 'helmet';
import compression from 'compression';
import { readFileSync } from 'fs';
import YAML from 'yamljs';
import { StatusCodes } from 'http-status-codes';
/
import { getApiOperations, errorMiddleware } from '../utils/functions';
//import { setUuid } from '../config';

interface IConfig {
  documentationPath: string;
  
}

export type OperationMap = { [name: string]: Handler } | { [name: string]: { [name: string]: Handler } };

const createExpressServer = (operationMap: OperationMap, config: IConfig) => {
  const app = express();

  // Common Middleware for all openAPI services
  app.use(helmet());
  let favicon = null;
  try {
    favicon = readFileSync('static/favicon.ico');
  } catch (e) {
    console.error('Cannot find favicon.');
  }
  app.get('/', (_, res) => {
    res.send();
  });
  app.get('/favicon.ico', (_, res) => {
    res.setHeader('content-type', 'image/vnd.microsoft.icon');
    res.send(favicon);
  });
  app.use(cors());
  app.options('*', cors());
  app.use(noCache());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const swaggerJSON = YAML.load(config.documentationPath);
  if (process.env.CODE_ENV !== 'production') {
    app.use('/swagger-ui', swaggerUi.serveFiles(swaggerJSON), swaggerUi.setup(swaggerJSON));
  }

  

  const operations = getApiOperations(operationMap);
  initialize({
    app,
    operations,
    errorMiddleware,
    apiDoc: config.documentationPath,
    promiseMode: true,
    exposeApiDocs: true
  });

  app.use(function (req, res) {
    res.status(StatusCodes.NOT_FOUND).json({ status: 404, message: `Not Found ${req.method}: ${req.url}` });
  });
  return app;
};

export default createExpressServer;
