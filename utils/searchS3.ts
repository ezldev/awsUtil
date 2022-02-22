import { AWSError, S3 } from 'aws-sdk';

export const searchS3 = function (bucketName: string,
                         keyPrefix: string,
                         lastModifiedDateThreshold?: Date): Promise<S3.ObjectList> {
  return new Promise((resolve, reject) => {
    console.log('Received search request for bucket: ' + bucketName + ', key prefix: ' + keyPrefix + ', and modifiedDateThreshold: ' + lastModifiedDateThreshold);
    const s3: S3 = new S3({ apiVersion: '2006-03-01' });
    const searchParams: S3.ListObjectsV2Request = {
      Bucket: bucketName,
      Prefix: keyPrefix
    }

    s3.listObjectsV2(searchParams, function(err: AWSError, data: S3.ListObjectsV2Output) {
      if(err) {
        console.log('Received error from S3: ' + err);
        reject(err);
      }

      else if (typeof lastModifiedDateThreshold !== undefined) {
        resolve(filterByModifiedDate(data.Contents, lastModifiedDateThreshold));
      }

      else {
        resolve(data.Contents);
      }
    });
  });
};

function filterByModifiedDate(documents: S3.ObjectList,
                              lastModifiedDateThreshold: Date): S3.ObjectList {
  let recentResults: S3.ObjectList = [];

  for (let document of documents) {
    if (document.LastModified > lastModifiedDateThreshold) {
      recentResults.push(document);
    }
  }

  return recentResults;
}