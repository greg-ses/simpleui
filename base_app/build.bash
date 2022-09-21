#!/bin/bash

fix_base_app(){
    BASE_APP=$1
    # egrep "\"baseHref\": \"[a-zA-Z0-9/]+\"" angular.json
    sed -i "s/\"baseHref\": \"\/\w*\/\"/\"baseHref\": \"\/${BASE_APP}\/\"/g" angular.json
}


prebuild() {
    BASE_APP=$1
    APP_PATH=$2

    # create assets folder in base_app
    mkdir ./src/assets
    ###cp -r $APP_PATH ./src/assets

    fix_base_app "$BASE_APP"

    # favicon.ico
    # cp $APP_PATH/images/favicon.ico /usr/src/app/base_app/assets/favicon.ico

    # # logo.png
    # cp $APP_PATH/images/logo.png /usr/src/app/base_app/assets/logo.png

    # # image-overlays.css
    # cp $APP_PATH/overlay-1/image-overlays.css /usr/src/app/base_app/assets/image-overlays.css

    # # components.xml (?)
    # #cp $APP_PATH/overlay-1/components.xml /usr/src/app/base_app/assets/components.xml
    
    # # overlay/images/*
    # cp $APP_PATH/overlay-1/images/* /usr/src/app/base_app/assets/overlay-1/
}


main() {
    BUILD_MODE=$1
    BASE_APP=$2
    APP_PATH=$3


    if [[ "${APP_PATH}" == "" ]]; then 
        APP_PATH="./src/test/simpleui.derivative/";
    fi

    if [[ "prod" == "${BUILD_MODE}" ]]; then
        bash make-version-text.bash build-client-prod
        rm -rf dist dist.tgz
        prebuild "$BASE_APP" "$APP_PATH" 
        ng build --aot --output-hashing all --no-source-map --no-named-chunks
        bash post-build-step.bash
        


    else  # dev
        bash make-version-txt.bash build-client-only
        rm -rf dist dist.tgz
        prebuild "$BASE_APP" "$APP_PATH"
        ng build --output-hashing all --configuration development
        bash post-build-step.bash --include-mocks


    fi

}

main "$@" # passes args into main