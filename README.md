# Simple UI

Simple UI is a real-time display framework using Angular for the front end display and nodeJs as a beck end service provider.

Project started by James Scarsdale and Greg Morehead.


## Prerequisites

Ansible version 2.9 or greater must be installed. Also, the target system must have an ssh server along with service user
of sudo privlages. Make sure that you can ssh as service to the target without a password by running 
`ssh-copy-id service@<target hostname>`

## Installation

**1.)** First make sure a base set of applications are installed target host machine. Run `os_scripts/web_gui_support.sh`.

**2.)** Install the `simple UI server`  
- In `phpStorm`, open the project `simpleui/simpleui-server/`.
- Open the `package.json` file, then follow the prompts to run `npm install`.
- Right-click `package.json`, and click `Show npm Scripts`.
- In the `npm` window, click `build`.
- In the `npm` window, click `copy-dist-to-output`.

**3.)** Install the `base_app`  
- In `phpStorm`, open the project `simpleui/base_app/`.
- Open `base_app/package.json`, then follow the prompts to run `npm install`.
- Right-click `package.json`, and click `Show npm Scripts`.


**3a)** **Production Build:**  
- In the phpstorm `npm` window, click `build-client-prod` to produce a `dist.tgz` file.
- In the phpstorm `npm` window, click `copy-dist-to-output` to copy the `dist.tgz` file to `../../../output/simpleui/base_app` for consumption by the deploy script.

**3b)** **Development Build:**  
- Right-click `base_app/webpack.config.js` and follow the prompts to run it.
- From the phpstorm `npm` window, select `build-client-dev` to produce a dist.tgz file.
- In the phpstorm `npm` window, click `copy-dist-to-output` to copy the `dist.tgz` file to `../../../output/simpleui/base_app` for consumption by the deploy script.

**4.)** add the following to your `.bashrc` file:

```
export REMOTE_WEB_GROUP="service"
export REMOTE_WEB_USER="service"
```

Then type `source ~/.bashrc` to reload it.

**5.)** _[Not a part of simpleui]_ Go to the project's `target/app/deploy` folder and run the appropriate web installation script. For example, `update_site.sh <hostname> pure_ui` 
will install the `purefication-web` web application on the hostname.
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

## Dependencies



## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Credits

This software uses the following open source packages:

ANGULAR ????

## License
[MIT](https://choosealicense.com/licenses/mit/)
