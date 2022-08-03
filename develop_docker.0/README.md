# simpleui/develop_docker folder

## Overview
This folder contains the files necessary for launcher docker containers to support active updates to the `simpleui` code.

## Usage

```
# from bash
cd simpleui/develop_docker
docker build -t angular-dev-image .
docker compose up -d 
cd ../base_app
npm run build-client-dev
code .&
(Use the launched VS Code window to edit the code)
(Open the URL http://localhost:4200 to see changes as you update the code.)
```
