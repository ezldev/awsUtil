# Monorepo for NodeJS Applications

This repository holds various lambdas and APIs for different applications.

### Testing

`npm test` or for development `npm test -w `for live-reload.

## Setup and Run Server

- Install NodeJS using NVM and use version 10 or higher. Setup and download instructions can be found at https://github.com/coreybutler/nvm-windows

  - After installation enter the following in the Command Prompt (CMD app)
    `nvm use 14.16.0`
  - Verify using command `node -v`

- On MAC OS (will use the .nvmrc file) `nvm use`

- Right click on CMD app select `Run CMD as administrator` and enter the following command

  `npm install -g windows-build-tools`

- Open the project in Visual Studio Code. Download VS Code at https://code.visualstudio.com/download

  - Open Terminal window using the link in the top nav bar.
  - Run `npm install` command which will install packages from package.json.

- Start server in Debug mode.

## Running the Application Locally without Debug Mode

`npm run dev`
