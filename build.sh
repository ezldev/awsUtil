#!/bin/sh

npm install
npm run build
rm -rf node_modules
cp package.json package.json.original
export NODE_ENV=production
sed -i '/aws-sdk/d' package.json
npm install --production
rm package.json
mv package.json.original package.json
rm -rf node_modules/@babel/
find . -name "*.gz" -type f -delete
find . -name "*.d.ts" -type f -delete
find . -name "*.md" -type f -delete
find . -name "*.txt" -type f -delete
find . -name "LICENSE" -type f -delete
sed -f  env/development.cnf  template-aws.yml  > template-aws.tmp.yml
aws cloudformation package --template template-aws.tmp.yml --s3-bucket "aws-utils-dev-builds" --output-template template-export.yml
aws cloudformation deploy --template-file template-export.yml --stack-name aws-util --capabilities CAPABILITY_IAM
sed -i '/DefinitionUri/d' template-export.yml
node ./ebs-buildscript.js