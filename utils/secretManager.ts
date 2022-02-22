import AWS from 'aws-sdk';

export function getAWSSecret(secretName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    var region = 'us-east-1',
      secret,
      decodedBinarySecret;

    // Create a Secrets Manager client
    var smc = new AWS.SecretsManager({ region });
    smc.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
          secret = JSON.parse(data.SecretString);
          resolve(secret);
        } else {
          let buff = Buffer.from(data.SecretBinary.toString(), 'base64');
          decodedBinarySecret = buff.toString('ascii');
          resolve(decodedBinarySecret);
        }
      }
    });
  });
}
