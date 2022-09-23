The changes:

1. Confirm what we want `/var/www/assets` to be below:
```
base_app:

angular.json
"assets": [
    "/var/www/assets"
],
```
2. Move the test files to the following structure:
```
test
├── demo-app
│       
│        ├── config
│        ├── data                (.xml & .json)
│        ├── overlay-1
│        ├── overlay-2
+
│   favicon.ico
│   logo.png

├── mock-bms-app
│        ├── config
│        ├── data                (.xml & .json)
│        ├── overlay-1
│        ├── overlay-2
+
│   favicon.ico
│   logo.png

├── mock-device-app
│        ├── config
│        ├── data                (.xml & .json)
│        ├── overlay-1
│        ├── overlay-2
+
│   favicon.ico
│   logo.png


└── script
    └── sample-data-collection (probably deprecated???)
```

3. Change deploy_docker to map the app overlays to `/var/www/assets`

```
/var/www/assets  (files from vcharge_platform/web/bms/simple_ui.derivative/overlay-1)
├── overlay-1
├── overlay-2
+
│   favicon.ico
│   logo.png

/var/www/bms     (files from vcharge_platform/web/bms/ (excluding simple_ui.derivative))
```