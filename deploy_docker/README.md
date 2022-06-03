# Docker Deployment Environment

This directory contains scripts and configuration files intended for use _inside_ the docker environment.

## Scripts

`run.sh` is intended to be the entry point into the docker container. This calls merge_app and launches all processes the simpleui service needs to run.

`merge_app.sh` merges the user-specific overlay(s) into the base simpleui build, modifies a few default configuration values, and then deploys the app to /var/www/

## Configuration Files

Just some basic apache configuration files for setting up proxying and the virtual host.
