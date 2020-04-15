#!/usr/bin/env bash

printf "\n------------------ Building dist/simpleui-server --------------------\n"
if $(test -d dist/simpleui-server); then rm -r dist/simpleui-server; fi

mkdir -p dist/simpleui-server
cp src/SERVICE-TEMPLATE.service dist/simpleui-server/
cp node_modules/crypt/crypt.js dist/simpleui-server/
cp node_modules/charenc/charenc.js dist/simpleui-server/
cp node_modules/sha1/sha1.js dist/simpleui-server/

transpileStatus=1
tsc --allowJs --outDir dist/simpleui-server -t es5 --lib "es5,es2015,es2016" --moduleResolution node --sourcemap src/simpleui-server.ts src/simpleui-server.ts
transpileStatus=$?

if $(test "$transpileStatus" -eq "0"); then printf "[simpleui-server.ts] transpile succeeded\n\n"; else "ERROR: simpleui-server.ts transpile failed\n\n"; fi
