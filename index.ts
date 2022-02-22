const st = new Date().getTime();

function checkApp(appName) {
  return !process.env.APP_NAME || process.env.APP_NAME.indexOf(appName) > -1;
}

if (checkApp('dashboard')) {
  const dashboard = require('./dashboard').app;
  const port = 8001;
  dashboard.listen(port, function () {
    console.log(`Dashboard at http://localhost:${port} - Boot Time: ${new Date().getTime() - st} ms`);
  });
}

if (checkApp('swaggerUI')) {
  const swagger = require('./swagger').app;
  const port = 8002;
  swagger.listen(port, function () {
    console.log(`Swagger at http://localhost:${port} - Boot Time: ${new Date().getTime() - st} ms`);
  });
}
