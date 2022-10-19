# simpleui/develop_docker folder

## Overview
This folder contains the files necessary for launcher docker containers to support active updates to the `simpleui` code.

## Usage

```
# from bash
cd simpleui/
docker build -t sui-dev-image -f develop_docker/Dockerfile .
bash run-dev-env.bash
# OR
cd base_app/
npm run start-client-dev
```

## Notes
- The `docker run` configuration can be found in `run-dev-env.bash`