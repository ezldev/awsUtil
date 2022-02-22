import { StatusCodes } from 'http-status-codes';
import queryString from 'querystring';
import { getConfig } from '../config';
import logger from './logger';
const rp = require('request-promise-native');

export async function sendMessage3C222(toNumber, message) {
  toNumber = toNumber.match(/(\d+)/g).join('');

  if (message && toNumber && toNumber.length === 10) {
    let smsConfig: any = await getConfig('sms');
    var options = {
      method: 'POST',
      url: 'https://platform.3cinteractive.com/api/send_message.php',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: queryString.stringify({
        ...smsConfig,
        phone_number: toNumber,
        message: message
      })
    };
    if (process.env.SMS_ENABLED) {
      return await rp(options);
    }
    return { message: 'message sent', url: message };
  }
  return;
}

type MessageWorkflowInput = {
  phoneNumber: number;
  [key: string]: any;
};

export async function sendMessageWorkflow(msg: MessageWorkflowInput) {
  const config = await getConfig('workflowSms');
  const body = queryString.stringify({
    ...config,
    phone_number: msg.phoneNumber,
    'attributes[coupon]': msg.id as string
  });

  const url = `https://platform.3cinteractive.com/api/workflow-initiator.php`;

  const options = {
    method: 'POST',
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  };

  try {
    if (process.env.SMS_ENABLED) {
      return await rp(options);
    } else {
      logger.warn('sendMessageWorkflow', 'SMS_ENABLED env is not set. SMS not actually sent out');
    }
    return { message: 'message sent' };
  } catch (e) {
    logger.error('sendMessageWorkflow', e);
    throw { message: e, status: StatusCodes.BAD_REQUEST };
  }
}

export async function sendMessage(toNumber, message) {
  const prefix = '1';
  toNumber = (toNumber || '') + '';
  toNumber = toNumber.match(/(\d+)/g).join('');

  if (message && toNumber && toNumber.length === 10) {
    toNumber = prefix + toNumber;
    let smsConfig = await getConfig('smsIMI');
    var options = {
      method: 'POST',
      url: smsConfig.url,
      headers: {
        'Content-Type': 'application/json',
        key: smsConfig.key
      },
      body: JSON.stringify({
        channel: 'sms',
        from: smsConfig.from,
        to: [
          {
            msisdn: [toNumber]
          }
        ],
        content: {
          type: 'text',
          text: message
        }
      })
    };
    if (process.env.SMS_ENABLED) {
      const response = JSON.parse(await rp(options));
      logger.info('sendMessage', 'SMS Data', response);
      return response;
    }
    return { message: 'message sent', url: message };
  }
  return;
}
