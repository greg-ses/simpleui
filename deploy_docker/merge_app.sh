#!/bin/bash

# Print command line help
if test "$#" \< "1"; then
  printf "\n    merge_app.sh - Merges user overlays into the base simpleui app\n"
  printf "\n    Usage: merge-derived-app.sh YOUR_APP_NAME\n"
  printf "      where 'YOUR_APP_NAME' is the name of the application.\n"
  exit 1
fi
# Parse command line
app_name="$1"

INCOMING_DIR="/overlays"
STAGING_DIR="/staging"
DEPLOY_DIR="/var/www/$app_name"

# Ensure output directories exist
mkdir -p "$INCOMING_DIR" "$STAGING_DIR" "$DEPLOY_DIR"

# Paths to built packages
simple_ui_dist="/tmp/client_dist.tgz"
simpleui_server_dist="/tmp/server_dist.tgz"

# Unpack the built simpleui client+server into the staging dir
tar xzf "${simple_ui_dist}" -C "${STAGING_DIR}"  --exclude=mock-data --exclude=example-overlay.tgz --exclude=example-overlay --exclude=examples
tar xzf "${simpleui_server_dist}" -C "${STAGING_DIR}"

# Scans the overlay directory for overlay names, then generates
# some HTML that requests the overlays' CSS files
if test -d "$INCOMING_DIR"; then
  pushd $INCOMING_DIR > /dev/null || exit 1

  linksAtEndOfHead=""
  i=1
  while test -d "overlay-${i}/";
  do
    if test -d "${STAGING_DIR}/overlay-${i}/"; then
      printf "\nRemoving folder ${STAGING_DIR}/overlay-${i}/.\n"
      rm -rf "${STAGING_DIR}/overlay-${i}/\n"
    fi

    printf "\nAdd overlay-${i}/...\n"
    tar czf overlay-${i}.tgz overlay-${i}
    tar xzf overlay-${i}.tgz -C "${STAGING_DIR}"

    linksAtEndOfHead="${linksAtEndOfHead}\n<link href=\"/${app_name}/overlay-${i}/image-overlays.css\" rel=\"stylesheet\">"
    i=$(expr ${i} + 1)
  done
  popd > /dev/null || exit 1
fi
linksAtEndOfHead="${linksAtEndOfHead}\n</head>"

# Rewrite some parts of index.html
(
  cd "${STAGING_DIR}" || exit 1
  < index.html awk -v appname="$app_name" -v linksAtEndOfHead="$linksAtEndOfHead" \
  '{ s=$0; \
    gsub("/simpleui/", "/" appname "/", s); \
    gsub("NgSimpleUi", appname, s); \
    gsub("</head>", linksAtEndOfHead, s); \
    print s;}' > newindex.html && mv newindex.html index.html
)

# Make sure some staging directories exist
mkdir -p "${STAGING_DIR}/doc"
mkdir -p "${STAGING_DIR}/images"
mkdir -p "${STAGING_DIR}/nodejs"
mkdir -p "${STAGING_DIR}/php"

# Copy overlay assets to the staging dir
if test -d $INCOMING_DIR/doc; then cp $INCOMING_DIR/doc/*.* ${STAGING_DIR}/doc; fi
if test -d $INCOMING_DIR/images; then cp $INCOMING_DIR/images/*.* ${STAGING_DIR}/images; fi
if test -d $INCOMING_DIR/nodejs; then cp -r $INCOMING_DIR/nodejs ${STAGING_DIR}; fi
if test -d $INCOMING_DIR/php; then cp $INCOMING_DIR/php/*.php ${STAGING_DIR}/php; fi
if test -f $INCOMING_DIR/.htaccess; then cp $INCOMING_DIR/.htaccess ${STAGING_DIR}; fi
cp $INCOMING_DIR/*.properties ${STAGING_DIR}

# Deploy
cp -a ${STAGING_DIR}/. "$DEPLOY_DIR/"
