# Simple UI

Simple UI is a real-time display framework using Angular for the front end display and nodeJs as a beck end service provider.

Project started by James Scarsdale and Greg Morehead.


## Prerequisites

Ansible version 2.9 or greater must be installed. Also, the target system must have an ssh server along with service user
of sudo privlages. Make sure that you can ssh as service to the target without a password by running 
_ssh-copy-id service@<target hostname>_

## Installation

**1.)** First make sure a base set of applications are installed target host machine. Run _os_scripts/web_gui_support.sh_.

**2.)** Install the simple UI server. From phpStorm open _simpleui-server/package.json_ and follow the prompts to run 
npm install.

**3.)** Install the base_app. Open _base_app/package.json_ and follow the prompts to run npm install. From the npm window
select _build-client-prod_ to produce a dist.tgz file.

**4.)** add the following to your _.bashrc_ file:

_export REMOTE_WEB_GROUP="service"_
_export REMOTE_WEB_USER="service"_

Then type _source ~/.bashrc_ to reload it.

**5.)** Go to to the projects _target/app/deploy_ folder and run the appropriate web installation script. For example, _update_site.sh <hostname> emsui_ 
will install the web application on the hostname.

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
