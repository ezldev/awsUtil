import { createLogger, format, transports } from 'winston';
import { getUuid } from '../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const customFormat = format.printf(info => {
  const msg = {
    level: info.level,
    uuid: getUuid(),
    timestamp: new Date().toUTCString(),
    method: info.method,
    message: info.message
  };
  if (info.details) msg['details'] = info.details;
  return JSON.stringify(msg);
});

const logger = createLogger({
  levels: levels,
  format: customFormat,
  transports: [new transports.Console({ level: getLevel() })]
});

function getLevel() {
  const level = process.env.LOG_LEVEL;
  if (level && levels[level]) return level;
  return 'error';
}

const logMethod = (level: 'info' | 'warn' | 'error' | 'debug') => (method: string, message: string, details?: object) =>
  logger[level](customFormat.transform({ level, method, message, details }));

export default {
  info: logMethod('info'),
  warn: logMethod('warn'),
  error: logMethod('error'),
  debug: logMethod('debug')
};
