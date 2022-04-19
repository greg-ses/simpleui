# Simple UI

Simple UI is a real-time display framework using `Angular 13` for the front end display
and `nodeJs` 16 as a back end service provider.  The front-end part of simpleui (`base_app`)
sends `http requests` to the backend end part of simpleui (`simpleui-server`), which in turn
sends and receives `ZeroMQ XML` messages to a second backend server (typically C++).
`simpleui-server` translates the received `.xml` into `.json` responses and sends them
back to the front end.   

Project started by James Scarsdale and Greg Morehead. Karen Cummings created much of the initial
scaffolding when Angular 2 was in constant flux. Tom Alexander has made very significant
architectural contributions to the product.


## Prerequisites

Ansible version 2.9 or greater must be installed. Also, the target system must have an ssh server along with service user
of sudo privlages. Make sure that you can ssh as service to the target without a password by running 
`ssh-copy-id service@<target hostname>`

## Installation
**[TODO: Verify consistency of these instructions with the deployments implemented
in the current "derived" applications.]**

**1.)** First make sure a base set of applications are installed target host machine or docker image - the
equivalent of running `os_scripts/web_gui_support.sh`.

**2.)** Build and install the `simple UI server`  
- In a `JetBrains IDE` (`clion`, `webstorm`, or `phpStorm`), open the project `simpleui/simpleui-server/`.
- Open the `package.json` file, then follow the prompts to run `npm install`.
- Right-click `package.json`, and click `Show npm Scripts`.
- In the `npm` window, click `build`.
- In the `npm` window, click `copy-dist-to-output`.

**3.)** Build and install the `base_app`  
- In the `JetBrains IDE`, open the project `simpleui/base_app/`.
- Open `base_app/package.json`, then follow the prompts to run `npm install`.
- Right-click `package.json`, and click `Show npm Scripts`.


**3a)** **Production Build:**  
- In the JetBrains IDE's `npm` window, click `build-client-prod` to produce a `dist.tgz` file.
- In the JetBrains IDE's `npm` window, click `copy-dist-to-output` to copy the `dist.tgz` file to `../../../output/simpleui/base_app` for consumption by the deploy script.

**3b)** **Development Build:**  
- Right-click `base_app/webpack.config.js` and follow the prompts to run it.
- From the JetBrains IDE's `npm` window, select `build-client-dev` to produce a dist.tgz file.
- In the JetBrains IDE's `npm` window, click `copy-dist-to-output` to copy the `dist.tgz` file to `../../../output/simpleui/base_app` for consumption by the deploy script.

**4.)** add the following to your `.bashrc` file:

```
export REMOTE_WEB_GROUP="service"
export REMOTE_WEB_USER="service"
```

Then type `source ~/.bashrc` to reload it.

**5.)** _[Not a part of simpleui]_ Go to the project's `target/app/deploy` folder and run the appropriate web installation script. For example, `update_site.sh <hostname> pure_ui` 
will install the `purification-web` web application on the hostname.

TODO: Make an example installer script to add to the open source project.

## Usage

TBD

## Wrappered Components

The following two applications are widely used by `derived` apps.
Because of this, they are bundled with `simpleui` for convenience.

- Params Editor - a standalone `AngularJS` (Angular 1)
- Fleetviewer - an application

## Dependencies
See `base_app/package.json` and `simpleui-server/package.json`.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Credits

Many open source packages are used by `Angular` and this project.
See `base_app/package.json` and `simpleui-server/package.json` for details.

## License
[MIT](https://choosealicense.com/licenses/mit/)
