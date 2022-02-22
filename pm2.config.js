module.exports = {
  apps: [
    {
      name: 'DashboardAPI',
      script: 'dist/index.js',
      instances: 0,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      env: {
        APP_NAME: 'dashboard'
      }
    }
  ]
};
