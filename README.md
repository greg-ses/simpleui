
![Frontend unit tests](https://github.com/greg-ses/simpleui/actions/workflows/frontend_tests.yml/badge.svg?event=push&branch=improve-testing)

![Docker image](https://github.com/greg-ses/simpleui/actions/workflows/dockerimage.yml/badge.svg)




# Simple UI

Simple UI is a real-time display framework using `Angular 14` for the front end display
and `Node.js` 18 as a back end service provider.  The front-end part of simpleui (`base_app`)
sends http requests to the backend end part of simpleui (`simpleui-server`), which in turn
sends and receives `ZeroMQ XML` messages to a second backend server (typically C++).
`simpleui-server` translates the received `.xml` into `.json` responses and sends them
back to the front end.


## Basic setup

- Node 18+
- NPM
- Docker


## Development installation

- Clone the repo `git clone https://github.com/greg-ses/simpleui simpleui && cd simpleui`
- Build the development docker container `docker build -t sui-dev-image -f develop_docker/Dockerfile .`
- start the dev enviroment `bash run-dev-env.bash`
    - This might take a while since it will download the `node_modules` for `base_app` and `simpleui-server`

## Production installation

We use ansible to deploy to production. Make sure that your ansible `yml` file is pointing to the correct release URL. If you are not sure, check out [Releases](https://github.com/greg-ses/simpleui/releases) for prod builds or [Packages](https://github.com/greg-ses/simpleui/pkgs/container/simpleui) for dev builds

## Testing

- start the dev enviroment and enter the docker container
- For frontend unit testing, run `ng test` in the `base_app` folder
- For backend unit testing, run `npm run test` in the `simpleui-server` folder
- E2E testing is coming soon
## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.


## Credits

Project started by James Scarsdale and Greg Morehead. Karen Cummings created much of the initial
scaffolding when Angular 2 was in constant flux. Tom Alexander has made very significant
architectural contributions to the product. Docker environment by Nick Tosta. Maintained By Zack Beucler


## License

[MIT](https://choosealicense.com/licenses/mit/)

