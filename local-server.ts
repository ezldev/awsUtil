const startTime = new Date().getTime();

let projects = [
  {
    path: './dashboard',
    name: 'Dashboard',
    port: 8001
  }
];

if (process.env.APP_NAME) {
  projects = projects.filter(p => p.name === process.env.APP_NAME);
}

projects.map(project => {
  const { app } = require(project.path);
  app.listen(project.port, () =>
    console.log(`${project.name} Listening on Port ${project.port} - Boot Time: ${new Date().getTime() - startTime} ms`)
  );
});
